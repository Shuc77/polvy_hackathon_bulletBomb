/**
 * @file 多设备时间轴同步（客户端）
 * @desc 解决「在 A 设备排好时间轴，B 设备打开同一个观看页却什么都没有」。
 *
 *   同步端点是开发服务器上的 `build/effect-sync-middleware.js`，按
 *   `channelId | 视频 Id` 分组。页面启动时先拉一次，之后每 1.5 秒轮询；
 *   本地一改就推上去，其他设备下一次轮询就会应用。
 *
 *   ★ 没有云端存储：服务端只在 `npm run dev` 时存在。静态部署下探测失败，
 *   状态会变成 `off`，此时仍然可以用工作台的「分享链接」把编排带过去。
 *
 *   ★ 轮询而不是 WebSocket：开发服务器只加一个普通中间件就够了，
 *   不用碰它的 HMR socket；1.5 秒的延迟对「排完特效看效果」完全够用。
 */
/** 同步端点。与 `build/effect-sync-middleware.js` 约定 */
const SYNC_PATH = '/__effect-sync';

/** 轮询间隔。配置只有几 KB，1.5 秒一次的开销可以忽略 */
const POLL_INTERVAL = 1500;

/** 本地改动合并推送的延迟，避免拖动时每帧发一个请求 */
const PUSH_DELAY = 250;

/** 单次请求超时，避免开发服务器卡死时一直挂着 */
const REQUEST_TIMEOUT = 5000;

export type EffectSyncStatus = 'off' | 'connecting' | 'synced' | 'error';

export interface EffectSyncOptions {
  /** 频道 + 视频的唯一键；不同直播/回放互不串配置 */
  key: string;
  /** 当前编排的 base64 文本（与分享链接、导出共用同一套序列化） */
  getPayload: () => string;
  /** 应用远端编排；由 store 直接替换，不触发本地改动回调 */
  applyPayload: (payload: string) => void;
  /** 订阅本地编排改动，返回取消订阅函数 */
  subscribeLocalChange: (listener: () => void) => () => void;
  /**
   * 是否算「发布端」
   * @desc 服务端为空时，不要随便把本机存档推上去 —— 观众设备上可能残留着
   *   别的频道/视频的配置。只有打开了工作台、并且本地确实有编排时，
   *   才认为这台设备是作者端，自动发布一次。
   */
  isPresenter: () => boolean;
  onStatus: (status: EffectSyncStatus) => void;
}

export interface EffectSyncHandle {
  /** 立即把当前编排推给其他设备（失败返回 false） */
  publish: () => Promise<boolean>;
  stop: () => void;
}

interface SyncResponse {
  version?: number;
  payload?: string | null;
  /** 开发服务器进程标识；变化说明服务重启过 */
  epoch?: number;
}

/** 校验过 `version` 的响应 */
interface SyncSnapshot extends SyncResponse {
  version: number;
}

/**
 * 启动同步
 * @desc 端点不存在（静态部署）时只发一次探测请求就会关闭，不会持续打扰。
 */
export function startEffectSync(options: EffectSyncOptions): EffectSyncHandle {
  if (typeof fetch !== 'function') {
    options.onStatus('off');

    return {
      publish: () => Promise.resolve(false),
      stop(): void {},
    };
  }

  const url = `${SYNC_PATH}?key=${encodeURIComponent(options.key)}`;

  let stopped = false;
  /** 端点确认存在并可用 */
  let enabled = false;
  /** 端点明确不存在（404 / 返回 HTML），不再重试 */
  let unavailable = false;
  /** 已应用或已发布的版本号 */
  let version = 0;
  /** 服务端进程标识；用于区分「服务重启」与「迟到的旧响应」 */
  let serverEpoch: number | undefined;
  /** 最近一次发布/应用的载荷，用于跳过无意义的重复推送 */
  let lastPayload = options.getPayload();
  /** 服务端为空时只自动发布一次 */
  let initialPublished = false;
  /** 正在推送，期间的新改动合并成一次尾随推送 */
  let pushing = false;
  let pendingPush = false;

  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;

  function setStatus(status: EffectSyncStatus): void {
    if (!stopped) {
      options.onStatus(status);
    }
  }

  function clearPoll(): void {
    if (pollTimer !== undefined) {
      clearTimeout(pollTimer);
      pollTimer = undefined;
    }
  }

  function disable(): void {
    unavailable = true;
    enabled = false;
    clearPoll();
    setStatus('off');
  }

  async function request(init?: RequestInit): Promise<Response | undefined> {
    if (typeof fetch !== 'function') {
      return undefined;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const timer = setTimeout(() => controller?.abort(), REQUEST_TIMEOUT);

    try {
      return await fetch(url, {
        ...init,
        cache: 'no-store',
        signal: controller?.signal,
      });
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 同步服务端进程标识
   * @returns 是否检测到服务重启
   * @desc 没有它时，一个「PUT 之后才返回的旧 GET」会把版本号误判成
   *   服务重启，进而整份重放一次配置。
   */
  function syncEpoch(data: SyncResponse): boolean {
    if (typeof data.epoch !== 'number') {
      return false;
    }

    if (serverEpoch === undefined) {
      serverEpoch = data.epoch;
      return false;
    }

    if (serverEpoch !== data.epoch) {
      serverEpoch = data.epoch;
      return true;
    }

    return false;
  }

  function schedulePush(delay = PUSH_DELAY): void {
    if (stopped || unavailable) {
      return;
    }

    if (pushTimer !== undefined) {
      clearTimeout(pushTimer);
    }

    pushTimer = setTimeout(() => {
      pushTimer = undefined;
      publish().catch(() => undefined);
    }, delay);
  }

  /**
   * 解析同步响应
   * @returns 无效响应返回 undefined
   * @desc 404 / HTML 说明端点根本不存在（静态部署），直接关闭同步；
   *   5xx 只标记错误，轮询继续。
   */
  async function readResponse(res: Response): Promise<SyncSnapshot | undefined> {
    if (!res.ok) {
      if (res.status === 404 || res.status === 405) {
        disable();
      } else {
        setStatus('error');
      }

      return undefined;
    }

    let data: SyncResponse;

    try {
      data = (await res.json()) as SyncResponse;
    } catch {
      // 静态部署会被 SPA 的 index.html 兜底，拿到的是 HTML
      disable();
      return undefined;
    }

    if (!data || typeof data.version !== 'number') {
      disable();
      return undefined;
    }

    return data as SyncSnapshot;
  }

  /**
   * 应用远端载荷
   * @returns 是否成功。失败时保留本地，下一次本地改动仍会重推
   */
  function applyRemote(data: SyncResponse): boolean {
    // 请求在途时可能已经切了作用域（回放对象解析完、站内换视频），
    // 迟到的旧响应不能盖到新作用域上
    if (stopped) {
      return false;
    }

    if (typeof data.payload !== 'string' || !data.payload) {
      return true;
    }

    try {
      options.applyPayload(data.payload);
      lastPayload = data.payload;
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }

  /** 推送当前编排（`force` 用于手动同步：即使载荷没变也重发） */
  async function publish(force = false): Promise<boolean> {
    if (stopped || unavailable) {
      return false;
    }

    const payload = options.getPayload();

    if (!force && enabled && payload === lastPayload) {
      return true;
    }

    if (pushing) {
      pendingPush = true;
      return false;
    }

    pushing = true;

    try {
      const res = await request({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      if (!res) {
        setStatus('error');
        // 自动发布失败就复位，下一次轮询会再试一次
        initialPublished = false;
        return false;
      }

      const data = await readResponse(res);

      if (!data) {
        initialPublished = false;
        return false;
      }

      syncEpoch(data);
      enabled = true;
      initialPublished = true;
      version = data.version;
      lastPayload = payload;
      setStatus('synced');
      return true;
    } finally {
      pushing = false;

      if (pendingPush) {
        pendingPush = false;
        schedulePush(0);
      }
    }
  }

  /**
   * 拉取远端配置
   * @desc `version` 由服务端单调递增。
   */
  async function pull(): Promise<void> {
    if (stopped || unavailable) {
      return;
    }

    const res = await request();

    if (!res) {
      // 网络错误可能只是开发服务器在重编译，保持轮询
      setStatus('error');
      return;
    }

    const data = await readResponse(res);

    if (!data) {
      return;
    }

    enabled = true;

    if (syncEpoch(data)) {
      // 开发服务器重启过，版本从 0 重新计数
      version = 0;
      initialPublished = false;
    }

    if (data.version < version) {
      /**
       * 迟到的旧响应（轮询先发出、PUT 后返回）直接忽略。
       * 没有 epoch 的旧端点无法区分重启，仍按原逻辑把版本拉回去。
       */
      if (typeof data.epoch !== 'number') {
        version = data.version;
        initialPublished = false;
      }

      return;
    }

    if (data.version > version) {
      const applied = applyRemote(data);

      version = data.version;

      if (!applied) {
        return;
      }
    }

    /**
     * 开发服务器刚启动、还没有任何配置：
     * 作者端（工作台开着且本地有编排）自动发布一次。
     * 观众端不发布，避免把本机残留的旧配置顶上去。
     */
    if (data.version === 0 && !initialPublished && options.isPresenter()) {
      initialPublished = true;
      publish(true).catch(() => undefined);
    }

    setStatus('synced');
  }

  function startPolling(): void {
    if (stopped || unavailable || pollTimer !== undefined) {
      return;
    }

    pollTimer = setTimeout(() => {
      pollTimer = undefined;

      pull()
        .finally(() => {
          startPolling();
        })
        .catch(() => undefined);
    }, POLL_INTERVAL);
  }

  const unsubscribe = options.subscribeLocalChange(() => {
    schedulePush();
  });

  setStatus('connecting');

  pull()
    .finally(() => {
      startPolling();
    })
    .catch(() => undefined);

  return {
    publish: () => publish(true),
    stop(): void {
      if (stopped) {
        return;
      }

      stopped = true;
      clearPoll();

      if (pushTimer !== undefined) {
        clearTimeout(pushTimer);
        pushTimer = undefined;
      }

      unsubscribe();
      options.onStatus('off');
    },
  };
}
