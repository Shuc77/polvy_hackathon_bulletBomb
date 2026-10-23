/**
 * @file 弹幕特效 store
 * @desc 锚点配置的唯一数据源：特效层、工作台、时间轴共用同一份，改完即时生效。
 */
import { defineStore } from 'pinia';
import { computed, onScopeDispose, ref, Ref, watch } from 'vue';
import { usePlaybackStore } from './use-playback-store';
import { getUrlQueryParams } from '@/hooks/core/use-query-params';
import {
  buildAnchorsShareUrl,
  getAnchorsQueryRaw,
} from '@/components/page-watch-common/barrage-effect/anchors-from-url';
import {
  createAnchorId,
  nearestFreeTime,
  parseAnchorsText,
  stringifyAnchors,
  type ParseStats,
} from '@/components/page-watch-common/barrage-effect/anchor-utils';
import {
  startEffectSync,
  type EffectSyncHandle,
  type EffectSyncStatus,
} from '@/components/page-watch-common/barrage-effect/effect-sync';
import { getEffectTemplate } from '@/components/page-watch-common/barrage-effect/effects';
import {
  DENSITY_DEFAULTS,
  normalizeDensityConfig,
  type DensityTriggerConfig,
} from '@/components/page-watch-common/barrage-effect/density-trigger';
import type {
  BarrageAnchor,
  EffectTemplateName,
  LiveTemplateConfig,
} from '@/components/page-watch-common/barrage-effect/types';

/**
 * 没有频道 / 视频参数时的兜底作用域
 * @desc 这种页面没有「哪个直播间」可言，只能共用一份配置；
 *   有频道或视频参数时一律按 `频道|视频` 隔离
 */
const FALLBACK_SCOPE = 'default';

/** 从 URL 参数里取单值 */
function pickQueryValue(value: string | string[] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value;

  return first || '';
}

/**
 * 存储作用域：同一频道 + 同一视频一份配置
 *
 * @desc ★ 不能再用全局键。换直播间后，上一间房的锚点会从 localStorage
 *   被读出来，工作台显示「6 个特效」、时间轴也全是别人的编排 ——
 *   而且工作台一开，同步端点还会把这份旧配置发布到新房子的 key 上。
 *
 *   作用域与同步 key 保持一致：直播带 `channelId`，回放再加 `playBackVid`。
 *   同一频道的直播和回放各自一份：前者的密度触发与后者的时间轴本来就不是一套东西。
 *
 *   ★ 旧版本的无作用域键 `plv-barrage-effect-anchors` 刻意不再读取：
 *   旧数据里没有记录它属于哪个直播间，读它就是把 A 间的编排带进 B 间。
 *   旧房间的编排仍可由同步端点恢复（key 本来就是 `频道|视频`）。
 *
 *   ★ 回放的 `playBackVid` 不一定一开始就在地址栏里：`use-main-enter` 要等
 *   回放对象解析完，才通过 `history.replaceState` 补上。因此这里优先用播放器
 *   已经解析出的视频 id，保证 store 首次实例化时就能落到正确的作用域。
 */
function resolveScopeKey(videoIdFromPlayer?: string): string {
  if (typeof window === 'undefined') {
    return FALLBACK_SCOPE;
  }

  try {
    const params = getUrlQueryParams();
    const channelId = pickQueryValue(params.channelId);
    const videoId =
      videoIdFromPlayer || pickQueryValue(params.playBackVid) || pickQueryValue(params.vid);

    return channelId || videoId ? `${channelId}|${videoId}` : FALLBACK_SCOPE;
  } catch {
    return FALLBACK_SCOPE;
  }
}

/** 高频写入的落盘延迟，单位：毫秒 */
const PERSIST_DELAY = 300;

/** 直播模板参数的存储键前缀。按**频道**存，不含视频 —— 直播与回放共用一份 */
const LIVE_TEMPLATES_KEY_PREFIX = 'plv-barrage-effect-live-templates:';

/** 时间轴锚点的存储键前缀。补直播参数时要拿它扫同频道的其他作用域 */
const ANCHORS_KEY_PREFIX = 'plv-barrage-effect-anchors:';

/** 模板级参数表：模板名 → 共享参数 */
type LiveTemplateConfigMap = Partial<Record<EffectTemplateName, LiveTemplateConfig>>;

/** 参数表里只留合法模板与合法字段，脏数据不能让 store 起不来 */
function normalizeLiveTemplateConfigs(input: unknown): LiveTemplateConfigMap {
  const result: LiveTemplateConfigMap = {};

  if (!input || typeof input !== 'object') {
    return result;
  }

  Object.keys(input as Record<string, unknown>).forEach(name => {
    const template = name as EffectTemplateName;

    if (!getEffectTemplate(template)) {
      return;
    }

    const raw = (input as Record<string, unknown>)[name];

    if (!raw || typeof raw !== 'object') {
      return;
    }

    const entry = raw as LiveTemplateConfig;
    // 空参数等于没配置：留着它会让「没有显式配置时用 triggerParams」失效
    const params =
      entry.params && typeof entry.params === 'object' && Object.keys(entry.params).length > 0
        ? { ...entry.params }
        : undefined;
    const spanSec =
      typeof entry.spanSec === 'number' && Number.isFinite(entry.spanSec) && entry.spanSec > 0
        ? entry.spanSec
        : undefined;

    if (!params && spanSec === undefined) {
      return;
    }

    result[template] = {
      ...(params ? { params } : {}),
      ...(spanSec !== undefined ? { spanSec } : {}),
    };
  });

  return result;
}

/** 导入的结果。`dropped` 单独拿出来是为了能如实报出「进来了一部分」 */
export interface ImportAnchorsResult extends ParseStats {
  /** 实际导进来的条数 */
  imported: number;
}

export interface BarrageEffectStore {
  /** 当前锚点列表，始终按时间升序 */
  anchors: Ref<BarrageAnchor[]>;
  /** 全屏工作台是否展开 */
  workbenchVisible: Ref<boolean>;
  /** 当前选中的锚点 id */
  selectedAnchorId: Ref<string | undefined>;
  /** 锚点是否来自地址栏，为 true 时工作台提示改动尚未落盘 */
  anchorsFromUrl: Ref<boolean>;
  /** 最近一次成功落盘的时间戳，供工作台显示「已自动保存」 */
  lastSavedAt: Ref<number | undefined>;
  /** 是否有一次延迟落盘还在排队 */
  isSaving: Ref<boolean>;
  /**
   * 多设备同步状态
   * @desc `off` 表示当前页面没有同步端点（静态部署），此时用分享链接
   */
  syncStatus: Ref<EffectSyncStatus>;
  /** 密度触发配置 */
  density: Ref<DensityTriggerConfig>;
  /**
   * 上次密度触发的时刻（`performance.now()`），未触发过为 undefined
   * @desc ★ **刻意不落盘**。时基是 `performance.now()`，它每次刷新都从 0 重新开始，
   *   存下来的旧时间戳与新的时钟一比就是负数，冷却会被算成好几十秒，
   *   表现为「刷新后怎么刷弹幕都不炸」——一个只在刷新后才出现的 bug
   */
  lastFiredAt: Ref<number | undefined>;

  /**
   * 当前选中的锚点
   * @desc 未选中时就是 `undefined`，**不兜底到第一条** ——
   *   「没选中」是有意义的状态：工作台据此预览模板的出厂形态，
   *   而不是把第一条锚点的参数冒充成模板默认值
   */
  selectedAnchor: Readonly<Ref<BarrageAnchor | undefined>>;
  /** 锚点数量 */
  anchorsCount: Readonly<Ref<number>>;

  addAnchorAt: (time: number, template?: EffectTemplateName) => BarrageAnchor;
  /** defer 用于滑块拖动这类高频写入：跳过重排，并把落盘合并到 300ms 尾部 */
  updateAnchor: (id: string, patch: Partial<BarrageAnchor>, opts?: { defer?: boolean }) => void;
  /**
   * 语义化的改时间：内部做边界收敛与整数化
   * @param opts.aligned 命中自动对齐时传 true：跳过 1 秒间隔推挤，落到精确位置
   */
  moveAnchor: (id: string, time: number, opts?: { aligned?: boolean }) => void;
  removeAnchor: (id: string) => void;
  selectAnchor: (id?: string) => void;
  clearAnchors: () => void;
  /**
   * 导入配置文本
   * @desc 返回的是**两个数**而不是一个：`imported` 为 0 是「全都没解析出来」，
   *   而 `imported > 0` 且 `dropped > 0` 是「进来了一部分」—— 后者以前完全不可见
   */
  importAnchors: (text: string) => ImportAnchorsResult;
  exportAnchors: () => string;
  /** 生成带当前编排的分享链接，供其他设备直接打开 */
  shareUrl: () => string;
  /** 立即把当前编排推送到局域网同步端点；端点不可用时返回 false */
  publishSync: () => Promise<boolean>;
  toggleWorkbench: (visible?: boolean) => void;
  /** 改密度触发配置，改完即落盘 */
  updateDensity: (patch: Partial<DensityTriggerConfig>) => void;
  /** 记一次触发，进入冷却 */
  markDensityFired: (at: number) => void;
  /**
   * 取模板的直播参数，已并入触发场合的短版默认值
   * @desc 直播手动触发、密度触发、点播新锚点都读这一份 —— 三处同一个出口
   */
  liveTemplateConfigOf: (template: EffectTemplateName) => LiveTemplateConfig;
  /**
   * 改模板的直播参数
   * @desc 补丁与锚点补丁同构（参数面板不区分两者），只取 `params` / `spanSec`。
   *   改完与点播回放共用，时间轴上的同款模板会读到同一个值
   */
  updateLiveTemplateConfig: (template: EffectTemplateName, patch: Partial<BarrageAnchor>) => void;
  /** 恢复出厂：清空全部锚点与本地存档 */
  resetAll: () => void;
}

export const useBarrageEffectStore = defineStore<'barrageEffect', BarrageEffectStore>(
  'barrageEffect',
  () => {
    const playbackStore = usePlaybackStore();

    /**
     * 当前页面的配置作用域，`频道|视频`
     * @desc 不是常量：进入回放页时，`playBackVid` 可能晚于 store 实例化才出现在
     *   地址栏里；站内从直播切到某条回放也要求同一实例换一份配置。
     *   变化时由 `switchScope` 落盘旧作用域并重新加载。
     */
    let scopeKey = FALLBACK_SCOPE;

    /** 配置在 localStorage 中的键名（按房间隔离） */
    let storageKey = '';

    /** 密度触发配置的键名。与锚点分开存：两者生命周期独立 */
    let densityKey = '';

    /** 记录「上次已应用的地址栏载荷」的键名 */
    let urlStampKey = '';

    /**
     * 直播模板参数的键名
     * @desc ★ 只到频道，不带视频：同一频道的直播与回放必须读写同一份，
     *   否则「回放里调好的倒计时」切到直播又是出厂值，等于要配两次
     */
    let liveTemplatesKey = '';

    /** 当前频道。扫同频道其他作用域的锚点存档时要用 */
    let channelScope = FALLBACK_SCOPE;

    /** 四个键名必须始终指向同一个作用域（直播参数只到频道一级） */
    function setScopeKeys(next: string): void {
      scopeKey = next;
      storageKey = `${ANCHORS_KEY_PREFIX}${next}`;
      densityKey = `plv-barrage-effect-density:${next}`;
      urlStampKey = `plv-barrage-effect-url-stamp:${next}`;
      channelScope = next.split('|')[0] || FALLBACK_SCOPE;
      liveTemplatesKey = `${LIVE_TEMPLATES_KEY_PREFIX}${channelScope}`;
    }

    const anchors = ref<BarrageAnchor[]>([]);
    const workbenchVisible = ref(false);
    const selectedAnchorId = ref<string>();
    const anchorsFromUrl = ref(false);

    /** 最近一次成功落盘的时间戳，供工作台显示「已保存」 */
    const lastSavedAt = ref<number>();
    /** 是否有一次延迟落盘还在排队 */
    const isSaving = ref(false);

    const density = ref<DensityTriggerConfig>({ ...DENSITY_DEFAULTS });
    const lastFiredAt = ref<number>();

    /** 模板级共享参数。直播与回放都读它，见 `liveTemplateConfigOf` */
    const liveTemplateConfigs = ref<LiveTemplateConfigMap>({});

    /** 多设备同步状态；没有同步端点时保持 off */
    const syncStatus = ref<EffectSyncStatus>('off');

    /**
     * 本地改动订阅者
     * @desc 同步模块据此把新编排推给其他设备。**远端应用不会触发这里** ——
     *   否则两端会互相回推，形成乒乓。
     */
    const localChangeListeners = new Set<() => void>();

    let persistTimer: ReturnType<typeof setTimeout> | undefined;
    let densityTimer: ReturnType<typeof setTimeout> | undefined;
    let liveTemplatesTimer: ReturnType<typeof setTimeout> | undefined;
    let syncHandle: EffectSyncHandle | undefined;

    function notifyLocalChange(): void {
      localChangeListeners.forEach(listener => listener());
    }

    function writeStorage(): void {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(anchors.value));
        lastSavedAt.value = Date.now();
      } catch {
        // 隐私模式等场景不可写，降级为仅内存
      }
    }

    function readStorage(): BarrageAnchor[] {
      try {
        const raw = window.localStorage.getItem(storageKey);
        return raw ? parseAnchorsText(raw) : [];
      } catch {
        return [];
      }
    }

    /**
     * 本地是否真的有一份草稿
     * @desc 与「读出来是不是空的」是两件事：`[]` 是用户主动清空后的草稿，
     *   必须尊重；**键不存在**则表示这台浏览器还没保存过任何改动
     */
    function hasStorageDraft(): boolean {
      try {
        return window.localStorage.getItem(storageKey) !== null;
      } catch {
        return false;
      }
    }

    function readUrlStamp(): string | undefined {
      try {
        return window.localStorage.getItem(urlStampKey) ?? undefined;
      } catch {
        return undefined;
      }
    }

    function writeUrlStamp(raw: string): void {
      try {
        window.localStorage.setItem(urlStampKey, raw);
      } catch {
        // 同上
      }
    }

    function writeDensityStorage(): void {
      try {
        window.localStorage.setItem(densityKey, JSON.stringify(density.value));
        lastSavedAt.value = Date.now();
      } catch {
        // 同上
      }
    }

    function readDensityStorage(): void {
      try {
        const raw = window.localStorage.getItem(densityKey);
        density.value = raw ? normalizeDensityConfig(JSON.parse(raw)) : { ...DENSITY_DEFAULTS };
      } catch {
        // 脏数据不该让 store 起不来，退回默认（默认是关闭的，最安全）
        density.value = { ...DENSITY_DEFAULTS };
      }
    }

    function writeLiveTemplatesStorage(): void {
      try {
        window.localStorage.setItem(liveTemplatesKey, JSON.stringify(liveTemplateConfigs.value));
        lastSavedAt.value = Date.now();
      } catch {
        // 隐私模式等场景不可写，降级为仅内存
      }
    }

    /**
     * 锚点 → 共享参数
     * @desc 空参数且没有时长时返回 undefined：这种锚点没有可同步的东西，
     *   把它写进共享表只会占住「已配置」的位置，挡住后面真正有配置的锚点
     */
    function liveConfigFromAnchor(anchor: BarrageAnchor): LiveTemplateConfig | undefined {
      const params =
        anchor.params && Object.keys(anchor.params).length > 0 ? { ...anchor.params } : undefined;
      const spanSec =
        typeof anchor.spanSec === 'number' && Number.isFinite(anchor.spanSec) && anchor.spanSec > 0
          ? anchor.spanSec
          : undefined;

      if (!params && spanSec === undefined) {
        return undefined;
      }

      return {
        ...(params ? { params } : {}),
        ...(spanSec !== undefined ? { spanSec } : {}),
      };
    }

    /** 把一组锚点里**还没配置过**的模板补进共享表 */
    function seedTemplatesFromAnchors(list: BarrageAnchor[], next: LiveTemplateConfigMap): void {
      list.forEach(anchor => {
        const config = liveConfigFromAnchor(anchor);

        if (config && !next[anchor.template]) {
          next[anchor.template] = config;
        }
      });
    }

    /**
     * 从同频道已保存的时间轴锚点补一份直播参数
     *
     * @desc 「配置跟点播回放同步」的第一步：这个能力上线之前，作者可能已经
     *   在回放工作台里把倒计时调成 30 秒了；直播这边不补一遍的话，点下去还是
     *   出厂值，看起来就像两份配置。
     *
     *   ★ **只补没有显式配置过的模板**。直播里改过的值比旧时间轴更「新」，
     *   不能反过来被旧存档盖掉。同一模板在多条回放里出现时，先扫到的算数 ——
     *   共享槽只有一个，这里刻意不搞「最后写入者」，避免每次刷新结果都不一样。
     */
    function seedLiveTemplatesFromChannel(configs: LiveTemplateConfigMap): void {
      try {
        const prefix = `${ANCHORS_KEY_PREFIX}${channelScope}|`;
        const next = { ...configs };

        for (let index = 0; index < window.localStorage.length; index += 1) {
          const key = window.localStorage.key(index);

          if (!key || !key.startsWith(prefix)) {
            continue;
          }

          const raw = window.localStorage.getItem(key);

          if (raw) {
            seedTemplatesFromAnchors(parseAnchorsText(raw), next);
          }
        }

        // 当前内存里的锚点也要算：从分享链接打开、还没落盘的那一份
        // 只在 localStorage 里扫是看不到的
        seedTemplatesFromAnchors(anchors.value, next);

        // 没有新增模板时 `next` 与 `configs` 的键数相同；有新增才落盘
        if (Object.keys(next).length !== Object.keys(configs).length) {
          liveTemplateConfigs.value = next;
          writeLiveTemplatesStorage();
        }
      } catch {
        // 本地存档读不到就按出厂值，直播本身仍然能放
      }
    }

    function readLiveTemplatesStorage(): void {
      let stored: LiveTemplateConfigMap = {};

      try {
        const raw = window.localStorage.getItem(liveTemplatesKey);
        stored = raw ? normalizeLiveTemplateConfigs(JSON.parse(raw)) : {};
      } catch {
        stored = {};
      }

      liveTemplateConfigs.value = stored;
      seedLiveTemplatesFromChannel(stored);
    }

    function persistLiveTemplatesDeferred(): void {
      isSaving.value = true;

      if (liveTemplatesTimer !== undefined) {
        clearTimeout(liveTemplatesTimer);
      }

      liveTemplatesTimer = setTimeout(() => {
        liveTemplatesTimer = undefined;
        isSaving.value = false;
        writeLiveTemplatesStorage();
      }, PERSIST_DELAY);
    }

    /**
     * 取某个模板的共享参数
     *
     * @desc 没有显式配置时用 `triggerParams`（触发场合的短版，如倒计时 10 秒）；
     *   **有配置时原样使用，不再垫触发短版**。垫了的话，回放里只改了时长的那条
     *   倒计时，到了直播会凭空多出一句触发用的文案（「倒计时」对「距离开始还有」），
     *   两边显示的就不是同一份配置了。
     *
     *   这里是**唯一**决定「没有配置时用什么」的地方，直播触发、密度触发、
     *   点播新锚点都走它，不各自拼一份
     */
    function liveTemplateConfigOf(template: EffectTemplateName): LiveTemplateConfig {
      const descriptor = getEffectTemplate(template);
      const stored = liveTemplateConfigs.value[template];

      if (stored) {
        return {
          params: { ...stored.params },
          spanSec: stored.spanSec,
        };
      }

      return { params: { ...descriptor?.triggerParams } };
    }

    function updateLiveTemplateConfig(
      template: EffectTemplateName,
      patch: Partial<BarrageAnchor>,
    ): void {
      if (!getEffectTemplate(template)) {
        return;
      }

      const previous = liveTemplateConfigs.value[template] ?? {};
      const next: LiveTemplateConfig = { ...previous };

      if (patch.params) {
        next.params = { ...previous.params, ...patch.params };
      }

      if ('spanSec' in patch) {
        next.spanSec = patch.spanSec;
      }

      if (!next.params && next.spanSec === undefined) {
        return;
      }

      liveTemplateConfigs.value = { ...liveTemplateConfigs.value, [template]: next };
      persistLiveTemplatesDeferred();
    }

    /**
     * 时间轴上的参数改动同步到直播参数
     *
     * @desc 「配置跟点播回放同步」的第二步：在回放里拖滑块、拖条带、改文案，
     *   直播里点同一个模板时用的就是刚调好的值。
     *
     *   ★ 换模板那一下不同步：那个补丁带着 `params: {}`，同步过去会把直播里
     *   调好的参数清空。多个同模板锚点时以最后一次被编辑的为准 —— 共享槽只有一个
     */
    function syncLiveConfigFromAnchor(
      template: EffectTemplateName,
      anchor: BarrageAnchor,
      patch: Partial<BarrageAnchor>,
    ): void {
      if ('template' in patch || 'feed' in patch) {
        return;
      }

      if (!('params' in patch) && !('spanSec' in patch)) {
        return;
      }

      const config = liveConfigFromAnchor(anchor);

      if (!config) {
        return;
      }

      liveTemplateConfigs.value = { ...liveTemplateConfigs.value, [template]: config };
      persistLiveTemplatesDeferred();
    }

    /**
     * 导入后同步模板参数
     * @desc 同一模板可能有多条锚点，而共享槽只有一个 —— 以**最后一条**为准
     *   （导入顺序就是配置书写顺序，最后一条通常也是作者最后调的那条）
     */
    function syncLiveConfigsFromAnchors(list: BarrageAnchor[]): void {
      const next = { ...liveTemplateConfigs.value };
      let changed = false;

      list.forEach(anchor => {
        const config = liveConfigFromAnchor(anchor);

        if (!config) {
          return;
        }

        next[anchor.template] = config;
        changed = true;
      });

      if (changed) {
        liveTemplateConfigs.value = next;
        persistLiveTemplatesDeferred();
      }
    }

    /**
     * 立即落盘并保持有序
     * @desc 首次发生改动后就不再是「地址栏配置」了，提示随之消失
     */
    function persistNow(): void {
      if (persistTimer !== undefined) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
      }

      isSaving.value = false;
      anchors.value.sort((a, b) => a.time - b.time);
      anchorsFromUrl.value = false;
      writeStorage();
      notifyLocalChange();
    }

    /**
     * 延迟落盘，供拖滑块等高频写入使用
     * @desc 刻意跳过重排：参数变化不动时间，顺序不可能变，
     *   而重排会在用户手里把数组换序。
     */
    function persistDeferred(): void {
      anchorsFromUrl.value = false;
      isSaving.value = true;

      if (persistTimer !== undefined) {
        clearTimeout(persistTimer);
      }

      persistTimer = setTimeout(() => {
        persistTimer = undefined;
        isSaving.value = false;
        anchors.value.sort((a, b) => a.time - b.time);
        writeStorage();
        notifyLocalChange();
      }, PERSIST_DELAY);
    }

    /**
     * 应用远端编排
     * @desc 走单独的入口而不是 `updateAnchor`：
     *   1. 远端配置是整份替换，不是局部改动；
     *   2. **不能触发本地改动回调**，否则同步模块会把刚收到的配置再推回去。
     */
    function applyRemoteAnchors(list: BarrageAnchor[]): void {
      if (persistTimer !== undefined) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
      }

      anchors.value = list.slice().sort((a, b) => a.time - b.time);
      isSaving.value = false;
      anchorsFromUrl.value = false;

      // 选中的锚点可能已经不在远端配置里
      if (
        selectedAnchorId.value &&
        !anchors.value.some(item => item.id === selectedAnchorId.value)
      ) {
        selectedAnchorId.value = undefined;
      }

      writeStorage();
    }

    /**
     * 读取当前作用域的锚点与密度配置
     * @desc 地址栏参数是「别人分享来的一套配置」，本地存档是「我自己改的草稿」。
     *   早先的写法是地址栏无条件优先，于是带着 `?barrageAnchors=` 调试时，
     *   每次刷新都会把工作台里的改动冲回原样 —— 看起来就像根本没有自动保存。
     *
     *   现在按载荷指纹判定：**同一份载荷只应用一次**。
     *   载荷没变 → 说明用户已经在这基础上改过，听本地存档的；
     *   载荷变了 → 是新的分享链接，采用它。
     *
     *   ★ 但「同一份载荷」不等于「本地已经接手了」：用分享链接打开、还没做过任何
     *   改动时，本地草稿根本不存在。这时刷新会读到空数组，时间轴上的特效就全没了
     *   （指纹记着「应用过」，链接反而被忽略）。所以补一条：**没有草稿就继续用链接**。
     *   用户真的主动清空过时，本地存的是 `[]` 而不是没有键 —— 那仍然听本地的。
     *
     *   指纹也按作用域分开：在 A 间应用过分享链接，不应该让 B 间忽略同一份链接。
     */
    function loadAnchorsForScope(): void {
      const urlRaw = getAnchorsQueryRaw();
      const urlAnchors = urlRaw ? parseAnchorsText(urlRaw) : [];
      const localDraft = hasStorageDraft();

      if (urlAnchors.length > 0 && (readUrlStamp() !== urlRaw || !localDraft)) {
        anchors.value = urlAnchors;
        anchorsFromUrl.value = true;
        writeUrlStamp(urlRaw as string);
      } else {
        anchors.value = readStorage();
      }

      // 与锚点各自独立：地址栏配置里没有密度触发（它是运行期事件，不是时间轴配置）
      readDensityStorage();
      // 直播参数同样独立，并且是**频道级**的：切回放视频不换这一份
      readLiveTemplatesStorage();
    }

    /** 把还在排队的延迟落盘立即写到**当前**作用域，用于切换前收尾 */
    function flushPendingWrites(): void {
      if (persistTimer !== undefined) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
        anchors.value.sort((a, b) => a.time - b.time);
        writeStorage();
      }

      if (densityTimer !== undefined) {
        clearTimeout(densityTimer);
        densityTimer = undefined;
        writeDensityStorage();
      }

      if (liveTemplatesTimer !== undefined) {
        clearTimeout(liveTemplatesTimer);
        liveTemplatesTimer = undefined;
        writeLiveTemplatesStorage();
      }

      isSaving.value = false;
    }

    /**
     * 启动当前作用域的同步
     * @desc 调用时 `anchors` 必须已经完成「地址栏 / 本地存档」的初始化，
     *   同步模块拿到的是最终生效的那一份，不会把初始化中途的空数组推上去。
     *
     *   同步 key 与存储作用域是同一个值；只有落到 `default`（没有频道/视频）
     *   才不启用同步，避免把不相关的页面串到一起。
     */
    function startSyncForScope(): void {
      syncHandle?.stop();
      syncHandle = undefined;

      if (scopeKey === FALLBACK_SCOPE) {
        syncStatus.value = 'off';
        return;
      }

      syncHandle = startEffectSync({
        key: scopeKey,
        getPayload: () => stringifyAnchors(anchors.value),
        applyPayload: payload => {
          applyRemoteAnchors(parseAnchorsText(payload));
        },
        subscribeLocalChange: listener => {
          localChangeListeners.add(listener);

          return () => {
            localChangeListeners.delete(listener);
          };
        },
        isPresenter: () => workbenchVisible.value && anchors.value.length > 0,
        onStatus: status => {
          syncStatus.value = status;
        },
      });
    }

    /**
     * 切换作用域
     * @desc 时机：回放对象解析完成后 `currentPlaybackTarget` 才就位，或者站内切了
     *   另一条回放。旧作用域排队中的改动先落盘，然后停掉旧同步 —— 否则旧请求迟到
     *   回来，会把上一间房的编排盖到新房间上。
     */
    function switchScope(next: string): void {
      if (next === scopeKey) {
        return;
      }

      flushPendingWrites();
      syncHandle?.stop();
      syncHandle = undefined;

      setScopeKeys(next);
      selectedAnchorId.value = undefined;
      anchorsFromUrl.value = false;
      lastSavedAt.value = undefined;
      lastFiredAt.value = undefined;

      loadAnchorsForScope();
      startSyncForScope();
    }

    /**
     * 当前作用域
     * @desc 视频 id 优先读播放器解析结果：地址栏的 `playBackVid` 由
     *   `use-main-enter` 在回放对象就位后通过 `history.replaceState` 补上，
     *   既晚于 store 实例化，也不会派发任何可监听的事件。
     */
    const resolvedScopeKey = computed(() =>
      resolveScopeKey(playbackStore.currentPlaybackTarget?.playbackId),
    );

    setScopeKeys(resolvedScopeKey.value);
    loadAnchorsForScope();
    startSyncForScope();

    watch(resolvedScopeKey, next => {
      switchScope(next);
    });

    onScopeDispose(() => {
      syncHandle?.stop();
      syncHandle = undefined;
    });

    /** 生成带当前编排的分享链接 */
    function shareUrl(): string {
      return buildAnchorsShareUrl(stringifyAnchors(anchors.value));
    }

    function publishSync(): Promise<boolean> {
      return syncHandle?.publish() ?? Promise.resolve(false);
    }

    const selectedAnchor = computed(() => {
      return anchors.value.find(item => item.id === selectedAnchorId.value);
    });

    const anchorsCount = computed(() => anchors.value.length);

    function addAnchorAt(time: number, template: EffectTemplateName = 'shockwave'): BarrageAnchor {
      /**
       * 新锚点的驱动方式**在创建这一刻写明**
       * @desc ★ 不能靠 `resolveFeedMode` 的兜底来给互动默认值 —— 那个兜底读的是
       *   `feedModes[0]`，而它同时服务着旧存档、旧分享链接和所有已导出的配置，
       *   动它等于把那些配置从「放一次」静默改成「开收集窗」。
       *   在这里写进锚点，影响面就只有「以后新拖进来的」。
       *
       *   缺 `defaultFeedMode` 的模板（纯转场的文字倒计时）**不写** `feed` ——
       *   它和旧锚点走同一条兜底路径，少一个字段就少一处能不一致的地方
       */
      const defaultFeedMode = getEffectTemplate(template)?.defaultFeedMode;

      /**
       * 新锚点从**共享的模板参数**起步
       * @desc 直播里调好的倒计时时长、配色、文案，拖到时间轴上时应该直接沿用 ——
       *   否则「同步」只在已经存在的锚点上成立，新加一条又回到出厂值。
       *   没有显式配置过的模板仍然是 `{}`，行为与以前逐帧一致
       */
      const sharedConfig = liveTemplateConfigs.value[template];

      const anchor: BarrageAnchor = {
        id: createAnchorId(),
        time: Math.max(0, Math.round(time)),
        template,
        params: sharedConfig?.params ? { ...sharedConfig.params } : {},
        ...(sharedConfig?.spanSec !== undefined ? { spanSec: sharedConfig.spanSec } : {}),
        /**
         * 新互动锚点默认开启答题卡
         * @desc 用户已经拍板「只做主动答题」：收集窗不能是静默统计。
         *   `collect: {}` 表示开启，题目与提前秒数走自动值；旧锚点没有这个字段，
         *   因此不会被这次默认值改味
         */
        ...(defaultFeedMode
          ? {
              feed: {
                mode: defaultFeedMode,
                ...(defaultFeedMode === 'static' ? {} : { collect: {} }),
              },
            }
          : {}),
      };

      anchors.value.push(anchor);
      persistNow();

      return anchor;
    }

    function updateAnchor(
      id: string,
      patch: Partial<BarrageAnchor>,
      opts?: { defer?: boolean },
    ): void {
      const target = anchors.value.find(item => item.id === id);
      if (!target) {
        return;
      }

      const template = target.template;

      Object.assign(target, patch);
      // 参数改动的同一拍同步给直播 —— 两边读同一份，不需要作者再配一次
      syncLiveConfigFromAnchor(template, target, patch);

      if (opts?.defer) {
        persistDeferred();
      } else {
        persistNow();
      }
    }

    /**
     * 改时间
     * @desc ★ 走 `nearestFreeTime` 而不是直接写：**放置**有 1 秒最小间距的规矩
     *   （时间轴的 `canCreateAt`），**移动**以前没有 —— 于是一条条带可以整个压在
     *   另一条上面，两条都选不中、也看不出来。这里让移动受同一条约束，
     *   越过界时不拒绝，吸附到最近的空位
     */
    function moveAnchor(id: string, time: number, opts?: { aligned?: boolean }): void {
      /**
       * ★ 命中自动对齐时不能再走 `nearestFreeTime`
       * @desc 那个函数会把落点从别的锚点旁边推开 1 秒 —— 而作者正是要贴上去。
       *   对齐是显式动作（时间轴上出现了黄色参考线才传 true），
       *   普通拖动仍然保留 1 秒间隔，两条路径分开
       */
      const next = opts?.aligned
        ? Math.max(0, Math.round(time))
        : nearestFreeTime(anchors.value, time, id);

      updateAnchor(id, { time: next });
    }

    function removeAnchor(id: string): void {
      const index = anchors.value.findIndex(item => item.id === id);
      if (index === -1) {
        return;
      }

      anchors.value.splice(index, 1);

      // 清掉选中，selectedAnchor 会自动落到第一条
      if (selectedAnchorId.value === id) {
        selectedAnchorId.value = undefined;
      }

      persistNow();
    }

    function selectAnchor(id?: string): void {
      selectedAnchorId.value = id;
    }

    function clearAnchors(): void {
      anchors.value = [];
      selectedAnchorId.value = undefined;
      persistNow();
    }

    function resetAll(): void {
      clearAnchors();

      density.value = { ...DENSITY_DEFAULTS };
      // 冷却也一起清：刚「重置」完却还要等十几秒才能验证触发，会让人以为没生效
      lastFiredAt.value = undefined;

      // 直播参数也是「本地存档」的一部分；排队中的延迟写入先取消，
      // 否则重置之后定时器一到，又把刚清掉的参数写回去
      liveTemplateConfigs.value = {};
      if (liveTemplatesTimer !== undefined) {
        clearTimeout(liveTemplatesTimer);
        liveTemplatesTimer = undefined;
      }

      try {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(densityKey);
        window.localStorage.removeItem(liveTemplatesKey);
        // 连指纹一起清掉，这样再刷新地址栏里的分享配置会重新生效 ——
        // 「重置」的语义就是回到刚打开这个链接的样子
        window.localStorage.removeItem(urlStampKey);
      } catch {
        // 同上，不可写就只清内存
      }

      lastSavedAt.value = undefined;
      isSaving.value = false;
    }

    /** 导入配置文本，返回进来多少条、丢了多少条 */
    function importAnchors(text: string): ImportAnchorsResult {
      const stats: ParseStats = { total: 0, dropped: 0 };
      const list = parseAnchorsText(text, stats);

      if (list.length === 0) {
        return { imported: 0, ...stats };
      }

      anchors.value = list;
      // 选中第一条：导入完什么都是空的会让人以为没导进去
      selectedAnchorId.value = list[0].id;
      // 导入的编排里也带着模板参数，直播那边一并接过来
      syncLiveConfigsFromAnchors(list);
      persistNow();

      return { imported: list.length, ...stats };
    }

    /** 导出为 base64 文本，可直接填进地址栏的 barrageAnchors 参数 */
    function exportAnchors(): string {
      return stringifyAnchors(anchors.value);
    }

    function toggleWorkbench(visible?: boolean): void {
      workbenchVisible.value = typeof visible === 'boolean' ? visible : !workbenchVisible.value;
    }

    /**
     * 延迟落盘密度配置
     * @desc 与锚点那套分开：那边顺带要排序、要清「配置来自地址栏」的提示，
     *   而密度触发根本不在地址栏里，蹭那套会把提示清掉
     */
    function persistDensityDeferred(): void {
      isSaving.value = true;

      if (densityTimer !== undefined) {
        clearTimeout(densityTimer);
      }

      densityTimer = setTimeout(() => {
        densityTimer = undefined;
        isSaving.value = false;
        writeDensityStorage();
      }, PERSIST_DELAY);
    }

    function updateDensity(patch: Partial<DensityTriggerConfig>): void {
      // 过一遍归一化：滑块、输入框都直连这里，钳制只有一处
      density.value = normalizeDensityConfig({ ...density.value, ...patch });
      persistDensityDeferred();
    }

    function markDensityFired(at: number): void {
      lastFiredAt.value = at;
    }

    return {
      anchors,
      workbenchVisible,
      selectedAnchorId,
      anchorsFromUrl,
      lastSavedAt,
      isSaving,
      syncStatus,
      density,
      lastFiredAt,

      selectedAnchor,
      anchorsCount,

      addAnchorAt,
      updateAnchor,
      moveAnchor,
      removeAnchor,
      selectAnchor,
      clearAnchors,
      importAnchors,
      exportAnchors,
      shareUrl,
      publishSync,
      toggleWorkbench,
      updateDensity,
      markDensityFired,
      liveTemplateConfigOf,
      updateLiveTemplateConfig,
      resetAll,
    };
  },
);
