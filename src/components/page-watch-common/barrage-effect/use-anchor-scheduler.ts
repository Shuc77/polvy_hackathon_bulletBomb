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

export const useAnchorScheduler = (options: {
  /** 获取当前锚点列表，允许运行期变化 */
  getAnchors: () => BarrageAnchor[];
  /** 命中锚点 */
  onHit: (anchor: BarrageAnchor) => void;
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

  let lastTime: number | undefined;

  function onTimeUpdate(payload: { currentTime: number }): void {
    const currentTime = payload?.currentTime ?? 0;

    if (lastTime === undefined) {
      lastTime = currentTime;
      return;
    }

    // 拖动进度条：重新武装全部锚点。本次不触发，避免「跳过去也放特效」
    if (Math.abs(currentTime - lastTime) > SEEK_THRESHOLD) {
      firedIds.clear();
      lastTime = currentTime;
      return;
    }

    if (options.shouldSuppress?.()) {
      // 照常推进时钟，只是不触发 —— 关掉工作台时才不会补放一堆积压的锚点
      lastTime = currentTime;
      return;
    }

    // 「跨越」判定：锚点落在 (上一帧, 这一帧] 区间内即命中。
    // 若用「锚点落在当前帧附近」的区间判定，500ms 的轮询间隔会漏掉正好夹在两次更新之间的锚点。
    const from = lastTime;
    const to = currentTime;

    options.getAnchors().forEach(anchor => {
      if (firedIds.has(anchor.id)) {
        return;
      }

      if (anchor.time > from && anchor.time <= to) {
        firedIds.add(anchor.id);
        options.onHit(anchor);
      }
    });

    lastTime = currentTime;
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
    lastTime = undefined;
  }

  return {
    reset,
  };
};
