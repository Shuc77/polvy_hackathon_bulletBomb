/**
 * @file 直播实时特效
 * @desc 直播没有时间轴，锚点调度器挂在播放进度上，而直播的进度恒为 0、
 *   这个事件一次都不会来 —— 所以「到点放」这条路在直播里根本不存在。
 *   管理员想「现在放一个礼花」时，只能另开一条触发路径。
 *
 *   这条路径由聊天室的自定义消息承担：`sendCustomMessage` 走的是与弹幕同一条
 *   socket，服务器会把消息广播给同一直播间的所有客户端。观看页本来就都连着聊天室，
 *   不需要再引入一套推送通道；`joinHistoryList: false` 让它不进入历史，
 *   后进来的观众不会莫名其妙看到一场已经放完的礼花。
 *
 *   ★ 收到消息后**必须去重**：`watchCore.chat` 与 `chatTarget` 共享同一个 socket，
 *   但各自有一份事件总线，同一条消息会从两边各转发一次。按消息体里自带的 nonce
 *   去重，比按消息 id 更稳 —— 两条链路给 id 的时机并不一致。
 *
 *   ★ 发送端自己不再重放：工作台是整屏浮层，真实图层被完全盖住，作者能看到的
 *   只有舞台预览。舞台已经放过一次，真实图层再放一次只会让音效叠两遍。
 *   判据用页面级的 `CLIENT_ID` 而不是 userId —— 同一个账号开的另一个页面应该照常播放。
 */
import { onBeforeUnmount, onMounted } from 'vue';
import { ChatEvents, ChatMsgSource } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { createAnchorId } from './anchor-utils';
import { createRuntimeAnchor } from './density-trigger';
import { getEffectTemplate } from './effects';
import type { BarrageAnchor, EffectParams, EffectTemplateName, LiveTemplateConfig } from './types';

/** 自定义事件名。与聊天室里其他自定义消息区分 */
export const LIVE_EFFECT_EVENT = 'barrage-effect-live';

/** 载荷版本。以后改结构时，旧版本的消息会被安静丢掉，而不是按错误的结构去用 */
const PAYLOAD_VERSION = 1;

/** chatTarget 由聊天室 SDK 异步创建，可能晚于特效层初始化，未就绪时按此节奏重试 */
const TARGET_RETRY_INTERVAL = 500;
const TARGET_RETRY_LIMIT = 20;

/** 记录多少个已处理的 nonce。一场直播里的触发次数不会太多，100 足够绕回一圈 */
const HANDLED_NONCE_LIMIT = 100;

/**
 * chat v2 的聊天 SDK 把客户端自定义消息标成 `customClient`
 * @desc `@polyv/live-watch-sdk` 的 `ChatMsgSource.CustomMessage` 是 `customMessage`，
 *   两者指的是同一条 socket 消息，只是两个包各自命名
 */
const CHAT_V2_CUSTOM_SOURCE = 'customClient';

/** 当前页面的实例标识。发送端据此跳过自己的回声 */
const CLIENT_ID = createAnchorId();

export interface LiveEffectPayload {
  version: number;
  template: EffectTemplateName;
  /**
   * 参数随消息一起走
   * @desc ★ 不能只发模板名让观众自己读本地配置：参数存在发送者的浏览器里，
   *   其他设备、其他观众的 localStorage 是空的（也可能是旧值），
   *   那样「作者调好的 30 秒倒计时」到了别人屏幕上会变回 10 秒。
   *   发出去的是**这一下最终用的参数**，全场逐帧一致
   */
  params?: EffectParams;
  /** 播放时长（秒）。倒计时的时长在 `params.countdownSec` 里，不走这里 */
  spanSec?: number;
  /** 发送页面的实例标识 */
  clientId: string;
  /** 一次触发的唯一标识，用于跨事件总线去重 */
  nonce: string;
}

/** 聊天消息中本模块关心的字段 */
interface LiveEffectChatMsg {
  msgSource?: string;
  EVENT?: string;
  data?: unknown;
}

/** 读一个数字字段并夹进区间 */
function takeNumber(
  source: Record<string, unknown>,
  key: keyof EffectParams,
  min: number,
  max: number,
): number | undefined {
  const value = source[key as string];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * 收窄并清洗参数
 *
 * @desc ★ 消息来自聊天室，**任何观众都能发**。只收模板真正会读的字段并钳制量级：
 *   不钳 `particles` 的话，一条 `particles: 1e9` 的自定义消息就能让所有观众的
 *   页面构造十亿个粒子。数组类字段（`glyphPool` / `barrageTexts`）是驱动层
 *   每帧注入的运行期数据，不从消息里收 —— 既没有意义，也给了对方塞大数组的口子
 */
function parseParams(raw: unknown): EffectParams | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }

  const source = raw as Record<string, unknown>;
  const params: EffectParams = {};

  /** 数值字段的可达区间 */
  const numberKeys: Array<[keyof EffectParams, number, number]> = [
    ['particles', 1, 400],
    ['ratio', 0, 1],
    ['bias', -1, 1],
    ['centerX', 0, 1],
    ['centerY', 0, 1],
    ['countdownSec', 1, 3600],
    ['revealSec', 1, 60],
  ];

  /** 文本字段与最大长度。与参数面板的输入限制保持一致 */
  const stringKeys: Array<[keyof EffectParams, number]> = [
    ['colorPrimary', 32],
    ['colorSecondary', 32],
    ['caption', 80],
    ['answerText', 80],
  ];

  numberKeys.forEach(([key, min, max]) => {
    const value = takeNumber(source, key, min, max);

    if (value !== undefined) {
      (params as Record<string, unknown>)[key as string] = value;
    }
  });

  stringKeys.forEach(([key, limit]) => {
    const value = source[key as string];

    if (typeof value === 'string') {
      (params as Record<string, unknown>)[key as string] = value.slice(0, limit);
    }
  });

  return params;
}

/** 收窄时长：非有限值、非正数一律当没带，避免 NaN 系数把轨道钉死 */
function parseSpanSec(raw: unknown): number | undefined {
  return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : undefined;
}

/** 校验并收窄载荷。任何一项不合规都返回 undefined，调用方静默忽略 */
function parseLiveEffectPayload(raw: unknown): LiveEffectPayload | undefined {
  /**
   * socket 里 `data` 可能是对象，也可能是 JSON 字符串
   * @desc 服务端各版本对自定义消息体的序列化方式并不统一；两种都收，
   *   否则一个版本差异就会让整条链路静默失效
   */
  let value = raw;

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const payload = value as Partial<LiveEffectPayload>;

  if (payload.version !== PAYLOAD_VERSION) {
    return undefined;
  }

  if (!payload.template || !getEffectTemplate(payload.template)) {
    return undefined;
  }

  if (!payload.clientId || !payload.nonce) {
    return undefined;
  }

  return {
    version: PAYLOAD_VERSION,
    template: payload.template,
    params: parseParams(payload.params),
    spanSec: parseSpanSec(payload.spanSec),
    clientId: payload.clientId,
    nonce: payload.nonce,
  };
}

/**
 * 广播实时特效
 * @desc 必须在 setup 里调用：`useGlobalInject` 依赖当前组件的注入上下文
 */
export function useLiveEffectSender() {
  const { getWatchCore } = useGlobalInject();

  /**
   * 放一个特效给直播间里所有人
   * @param config 作者为该模板调好的参数；随消息发出，观众不需要有同一份本地配置
   * @returns 服务端返回的消息 id
   */
  async function send(template: EffectTemplateName, config?: LiveTemplateConfig): Promise<string> {
    const payload: LiveEffectPayload = {
      version: PAYLOAD_VERSION,
      template,
      ...(config?.params ? { params: config.params } : {}),
      ...(config?.spanSec !== undefined ? { spanSec: config.spanSec } : {}),
      clientId: CLIENT_ID,
      nonce: createAnchorId(),
    };

    return getWatchCore().chat.sendCustomMessage({
      EVENT: LIVE_EFFECT_EVENT,
      data: payload,
      version: PAYLOAD_VERSION,
      joinHistoryList: false,
    });
  }

  return { send };
}

/**
 * 接收其他页面广播来的实时特效
 * @param onTrigger 回调里拿到的是可以直接交给驱动器的运行期锚点
 */
export function useLiveEffectReceiver(onTrigger: (anchor: BarrageAnchor) => void) {
  const { getWatchCore } = useGlobalInject();

  /** 已处理的 nonce，用于两条事件总线去重 */
  const handledNonces = new Set<string>();
  const handledQueue: string[] = [];

  let unsubscribers: Array<() => void> = [];
  let retryTimer: number | undefined;
  let retryCount = 0;
  let started = false;

  /**
   * 登记 nonce
   * @returns 首次出现返回 true，已经处理过返回 false
   */
  function tryMarkHandled(nonce: string): boolean {
    if (handledNonces.has(nonce)) {
      return false;
    }

    handledNonces.add(nonce);
    handledQueue.push(nonce);

    if (handledQueue.length > HANDLED_NONCE_LIMIT) {
      const oldest = handledQueue.shift();
      if (oldest) {
        handledNonces.delete(oldest);
      }
    }

    return true;
  }

  function handleChatMsg(chatMsg?: LiveEffectChatMsg): void {
    /**
     * 回放页不接收直播间的实时特效
     * @desc 同一频道的直播与回放共用聊天室。不挡的话，直播里放的礼花会
     *   突然出现在正在看回放的观众屏幕上 —— 那场「直播」跟他们没关系
     */
    if (getWatchCore().isPlaybackWatchByVid()) {
      return;
    }

    if (!chatMsg || chatMsg.EVENT !== LIVE_EFFECT_EVENT) {
      return;
    }

    if (
      chatMsg.msgSource !== ChatMsgSource.CustomMessage &&
      chatMsg.msgSource !== CHAT_V2_CUSTOM_SOURCE
    ) {
      return;
    }

    const payload = parseLiveEffectPayload(chatMsg.data);

    if (!payload) {
      return;
    }

    // 自己发的：舞台预览已经放过了，真实图层再放一次只会叠音
    if (payload.clientId === CLIENT_ID) {
      return;
    }

    if (!tryMarkHandled(payload.nonce)) {
      return;
    }

    onTrigger(
      createRuntimeAnchor(payload.template, {
        params: payload.params,
        spanSec: payload.spanSec,
      }),
    );
  }

  /** 订阅 watch SDK 自己的聊天事件（chat v1 / 回放） */
  function subscribeWatchChat(): void {
    const { eventEmitter } = getWatchCore().chat;

    const onChatMessage = (data?: { chatMsg?: LiveEffectChatMsg }) => {
      handleChatMsg(data?.chatMsg);
    };

    eventEmitter.on(ChatEvents.ChatMessage, onChatMessage);
    unsubscribers.push(() => {
      eventEmitter.off(ChatEvents.ChatMessage, onChatMessage);
    });
  }

  /**
   * 订阅 chat v2 的聊天事件
   * @returns chatTarget 尚未创建时返回 false
   */
  function subscribeChatTarget(): boolean {
    const chatTarget = getWatchCore().chat.chatTarget;
    if (!chatTarget) {
      return false;
    }

    const { eventEmitter, PolyvChatEvent } = chatTarget;

    const onChatMessage = (data?: { chatMsg?: LiveEffectChatMsg }) => {
      handleChatMsg(data?.chatMsg);
    };

    eventEmitter.on(PolyvChatEvent.ChatMessage, onChatMessage);
    unsubscribers.push(() => {
      eventEmitter.off(PolyvChatEvent.ChatMessage, onChatMessage);
    });

    return true;
  }

  function scheduleTargetRetry(): void {
    if (retryTimer !== undefined || retryCount >= TARGET_RETRY_LIMIT) {
      return;
    }

    retryCount += 1;
    retryTimer = window.setTimeout(() => {
      retryTimer = undefined;

      if (!started) {
        return;
      }

      if (!subscribeChatTarget()) {
        scheduleTargetRetry();
      }
    }, TARGET_RETRY_INTERVAL);
  }

  function start(): void {
    if (started) {
      return;
    }

    started = true;
    subscribeWatchChat();

    if (!subscribeChatTarget()) {
      scheduleTargetRetry();
    }
  }

  function stop(): void {
    started = false;
    retryCount = 0;

    if (retryTimer !== undefined) {
      window.clearTimeout(retryTimer);
      retryTimer = undefined;
    }

    unsubscribers.forEach(unsubscribe => unsubscribe());
    unsubscribers = [];
  }

  onMounted(start);
  onBeforeUnmount(stop);
}
