/**
 * @file 弹幕特效 store
 * @desc 锚点配置的唯一数据源：特效层、工作台、时间轴共用同一份，改完即时生效。
 */
import { defineStore } from 'pinia';
import { computed, ref, Ref } from 'vue';
import { getAnchorsQueryRaw } from '@/components/page-watch-common/barrage-effect/anchors-from-url';
import {
  createAnchorId,
  nearestFreeTime,
  parseAnchorsText,
  stringifyAnchors,
  type ParseStats,
} from '@/components/page-watch-common/barrage-effect/anchor-utils';
import { getEffectTemplate } from '@/components/page-watch-common/barrage-effect/effects';
import {
  DENSITY_DEFAULTS,
  normalizeDensityConfig,
  type DensityTriggerConfig,
} from '@/components/page-watch-common/barrage-effect/density-trigger';
import type {
  BarrageAnchor,
  EffectTemplateName,
} from '@/components/page-watch-common/barrage-effect/types';

/** 配置在 localStorage 中的键名 */
const STORAGE_KEY = 'plv-barrage-effect-anchors';

/** 密度触发配置的键名。与锚点分开存：两者生命周期独立 */
const DENSITY_KEY = 'plv-barrage-effect-density';

/** 记录「上次已应用的地址栏载荷」的键名 */
const URL_STAMP_KEY = 'plv-barrage-effect-url-stamp';

/** 高频写入的落盘延迟，单位：毫秒 */
const PERSIST_DELAY = 300;

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
  /** 语义化的改时间：内部做边界收敛与整数化 */
  moveAnchor: (id: string, time: number) => void;
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
  toggleWorkbench: (visible?: boolean) => void;
  /** 改密度触发配置，改完即落盘 */
  updateDensity: (patch: Partial<DensityTriggerConfig>) => void;
  /** 记一次触发，进入冷却 */
  markDensityFired: (at: number) => void;
  /** 恢复出厂：清空全部锚点与本地存档 */
  resetAll: () => void;
}

export const useBarrageEffectStore = defineStore<'barrageEffect', BarrageEffectStore>(
  'barrageEffect',
  () => {
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

    let persistTimer: ReturnType<typeof setTimeout> | undefined;
    let densityTimer: ReturnType<typeof setTimeout> | undefined;

    function writeStorage(): void {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(anchors.value));
        lastSavedAt.value = Date.now();
      } catch {
        // 隐私模式等场景不可写，降级为仅内存
      }
    }

    function readStorage(): BarrageAnchor[] {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? parseAnchorsText(raw) : [];
      } catch {
        return [];
      }
    }

    function readUrlStamp(): string | undefined {
      try {
        return window.localStorage.getItem(URL_STAMP_KEY) ?? undefined;
      } catch {
        return undefined;
      }
    }

    function writeUrlStamp(raw: string): void {
      try {
        window.localStorage.setItem(URL_STAMP_KEY, raw);
      } catch {
        // 同上
      }
    }

    function writeDensityStorage(): void {
      try {
        window.localStorage.setItem(DENSITY_KEY, JSON.stringify(density.value));
        lastSavedAt.value = Date.now();
      } catch {
        // 同上
      }
    }

    function readDensityStorage(): void {
      try {
        const raw = window.localStorage.getItem(DENSITY_KEY);
        density.value = raw ? normalizeDensityConfig(JSON.parse(raw)) : { ...DENSITY_DEFAULTS };
      } catch {
        // 脏数据不该让 store 起不来，退回默认（默认是关闭的，最安全）
        density.value = { ...DENSITY_DEFAULTS };
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
      }, PERSIST_DELAY);
    }

    /**
     * 初始化
     * @desc 地址栏参数是「别人分享来的一套配置」，本地存档是「我自己改的草稿」。
     *   早先的写法是地址栏无条件优先，于是带着 `?barrageAnchors=` 调试时，
     *   每次刷新都会把工作台里的改动冲回原样 —— 看起来就像根本没有自动保存。
     *
     *   现在按载荷指纹判定：**同一份载荷只应用一次**。
     *   载荷没变 → 说明用户已经在这基础上改过，听本地存档的；
     *   载荷变了 → 是新的分享链接，采用它。
     */
    const urlRaw = getAnchorsQueryRaw();
    const urlAnchors = urlRaw ? parseAnchorsText(urlRaw) : [];

    if (urlAnchors.length > 0 && readUrlStamp() !== urlRaw) {
      anchors.value = urlAnchors;
      anchorsFromUrl.value = true;
      writeUrlStamp(urlRaw as string);
    } else {
      anchors.value = readStorage();
    }

    // 与锚点各自独立：地址栏配置里没有密度触发（它是运行期事件，不是时间轴配置）
    readDensityStorage();

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

      const anchor: BarrageAnchor = {
        id: createAnchorId(),
        time: Math.max(0, Math.round(time)),
        template,
        params: {},
        ...(defaultFeedMode ? { feed: { mode: defaultFeedMode } } : {}),
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

      Object.assign(target, patch);

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
    function moveAnchor(id: string, time: number): void {
      updateAnchor(id, { time: nearestFreeTime(anchors.value, time, id) });
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

      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(DENSITY_KEY);
        // 连指纹一起清掉，这样再刷新地址栏里的分享配置会重新生效 ——
        // 「重置」的语义就是回到刚打开这个链接的样子
        window.localStorage.removeItem(URL_STAMP_KEY);
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
      toggleWorkbench,
      updateDensity,
      markDensityFired,
      resetAll,
    };
  },
);
