/**
 * @file 时间锚点调度
 * @desc 监听播放进度，命中锚点时回调；并识别拖动进度条，保证回看能重新触发。
 *
 * 不依赖 SDK 的 `PlvTimeAxisMarkModule`：它是 `@internal` 模块，只提供读列表和 seek，
 * 没有「预设标记 + 到达回调」的能力。
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';
import type { BarrageAnchor } from './types';

/** 相邻两次时间更新的差值超过该阈值时，判定为拖动了进度条 */
const SEEK_THRESHOLD = 2;

/**
 * 首次时间更新落在片头多远以内时，把触发区间从 0s 算起
 * @desc 播放器 500ms 一跳：从 0s 起播时，调度器拿到的第一条时间很可能已经是
 *   0.5s。若以它为起点，`time >= from` 永远不会命中 0s 的锚点 ——
 *   作者最常把第一个特效放在 0s，表现就是「文字倒计时根本不出现」。
 *   只对片头放这个窗口；页面从 5 分钟处恢复时，不该把 0s 的特效补放出来
 */
const INITIAL_START_WINDOW = 1.5;

export const useAnchorScheduler = (options: {
  /** 获取当前锚点列表，允许运行期变化 */
  getAnchors: () => BarrageAnchor[];
  /** 命中锚点 */
  onHit: (anchor: BarrageAnchor) => void;
  /**
   * 提前多少秒开始收集；0 / 缺省 = 不预滚
   * @desc 判据收在 `collect.ts`，这里只要一个数。调度器不关心答题卡长什么样
   */
  getApproachLeadSec?: (anchor: BarrageAnchor) => number;
  /** 进入预滚区间（答题卡该出现了） */
  onApproach?: (anchor: BarrageAnchor) => void;
  /**
   * 播放进度更新
   * @desc 每帧都回调，供答题卡倒计时使用。**在 onApproach / onHit 之后调用**，
   *   这样同一帧里新排进来的答题卡也能立刻拿到剩余时间
   */
  onProgress?: (currentTime: number) => void;
  /** 拖动进度条：清空答题卡队列。参数是 seek 后的播放头（秒） */
  onSeek?: (currentTime: number) => void;
  /**
   * 是否暂停触发
   * @desc 工作台打开时用。浮层把播放器整个盖住了，此时在真实图层上放特效纯属浪费；
   *   而且作者正在里面拖时间轴，特效会在看不见的地方被消耗掉。
   *   注意实现里**照常推进 `lastTime`**，否则关掉工作台会把这一段时间内错过的锚点一次性补放
   */
  shouldSuppress?: () => boolean;
}) => {
  const { getWatchCore } = useGlobalInject();

  /**
   * 本轮播放中已触发过的锚点，拖动进度条后清空以允许重看
   * @desc 记 id 而不是下标：配置面板会在播放中增删锚点，下标会错位
   */
  const firedIds = new Set<string>();

  /**
   * 已经弹过答题卡的锚点
   * @desc 与 `firedIds` **分开记**：预滚命中后、锚点命中前，这段时间里
   *   每次时间更新都会重新扫到它，共用一个集合会导致答题卡刚出现就被当成「已触发」
   */
  const approachedIds = new Set<string>();

  let lastTime: number | undefined;
  /** 上一次更新时是否被暂停。工作台关掉的那一帧要补一次预滚 */
  let wasSuppressed = false;

  function onTimeUpdate(payload: { currentTime: number }): void {
    const currentTime = payload?.currentTime ?? 0;
    const first = lastTime === undefined;
    const seek = lastTime !== undefined && Math.abs(currentTime - lastTime) > SEEK_THRESHOLD;

    // 拖动进度条：重新武装全部锚点。本次不触发，避免「跳过去也放特效」
    if (seek) {
      firedIds.clear();
      approachedIds.clear();
      options.onSeek?.(currentTime);
    }

    const suppressed = options.shouldSuppress?.() ?? false;
    // 工作台刚关掉：把「已经身处收集期」的锚点补上，否则关掉后答题卡永远不出现
    const resumed = wasSuppressed && !suppressed;

    /**
     * 首次时间更新、seek 之后、工作台刚关掉，都要**主动补一次**预滚
     * @desc 只靠「跨越」判定的话，刷新页面刚好落在答题期中间、或拖进收集段里，
     *   答题卡永远不出现 —— 观众能发弹幕，但没有任何提示该发什么。
     *   普通推进时仍用跨越判定，避免每帧对全部锚点重复排队
     */
    if (!suppressed) {
      /**
       * 本帧扫描的起点
       * @desc 片头第一条更新时间可能已经是 0.5s，必须从 0s 起算，
       *   否则 0s 的锚点永远落在窗口左边。其余情况仍从上一帧起算，
       *   从 5 分钟处恢复页面不会把片头的特效补放出来
       */
      const from = first
        ? currentTime <= INITIAL_START_WINDOW
          ? 0
          : currentTime
        : (lastTime as number);
      const to = currentTime;
      const prime = first || seek || resumed;

      options.getAnchors().forEach(anchor => {
        if (approachedIds.has(anchor.id)) {
          return;
        }

        const leadSec = options.getApproachLeadSec?.(anchor) ?? 0;
        if (!(leadSec > 0)) {
          return;
        }

        const approachTime = anchor.time - leadSec;
        // 普通推进看「跨越」，首次 / seek / 恢复之后看「此刻是否已经在里面」
        const hit = prime
          ? currentTime >= approachTime && currentTime < anchor.time
          : approachTime > from && approachTime <= to;

        if (!hit) {
          return;
        }

        approachedIds.add(anchor.id);
        options.onApproach?.(anchor);
      });

      if (!seek) {
        /**
         * 「跨越」判定：闭区间 `[上一帧, 这一帧]`
         * @desc 用开区间的话，恰好落在起点的锚点永远差一格：seek 到 02:30
         *   按播放、页面正好停在 0s、刚把特效拖到播放头所在秒，都不会触发。
         *   重复命中由 `firedIds` 挡掉，所以闭区间不会放两遍
         */
        options.getAnchors().forEach(anchor => {
          if (firedIds.has(anchor.id)) {
            return;
          }

          if (anchor.time >= from && anchor.time <= to) {
            firedIds.add(anchor.id);
            options.onHit(anchor);
          }
        });
      }
    }

    // 答题卡倒计时：即使在 seek 那一帧也要刷新，否则会停在旧读数
    options.onProgress?.(currentTime);

    lastTime = currentTime;
    wasSuppressed = suppressed;
  }

  onMounted(() => {
    getWatchCore().player.eventEmitter.on(PlayerEvents.TimeUpdate, onTimeUpdate);
  });

  onBeforeUnmount(() => {
    getWatchCore().player.eventEmitter.off(PlayerEvents.TimeUpdate, onTimeUpdate);
  });

  /** 重新武装全部锚点 */
  function reset(): void {
    firedIds.clear();
    approachedIds.clear();
    lastTime = undefined;
    wasSuppressed = false;
  }

  return {
    reset,
  };
};
