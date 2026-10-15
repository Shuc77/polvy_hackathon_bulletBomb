/**
 * @file 共享画布时钟
 * @desc 全局只跑一条 requestAnimationFrame，所有画布订阅它。不用「一块画布一条循环」有三个原因，
 *   性能只排第三：
 *   1. 每个循环各算各的 delta，同一特效在缩略图与舞台上会相位漂移；
 *   2. 「关掉工作台停掉 6 个缩略图」会变成 6 个生命周期，而不是一次退订；
 *   3. 这是唯一能让生产层停下来的办法 —— 工作台盖住播放器时它没必要继续跑。
 */

/** 单帧最大步进，避免切回标签页后一次推进过多 */
const MAX_FRAME_DELTA = 0.1;

type TickerCallback = (delta: number) => void;

const subscribers = new Set<TickerCallback>();

let rafId: number | undefined;
let lastFrameTime = 0;

function schedule(): void {
  if (rafId === undefined) {
    rafId = window.requestAnimationFrame(tick);
  }
}

function tick(timestamp: number): void {
  rafId = undefined;

  // 首帧记 0；循环停过再恢复时 delta 会被 clamp，特效不会「瞬移」
  const delta =
    lastFrameTime === 0 ? 0 : Math.min((timestamp - lastFrameTime) / 1000, MAX_FRAME_DELTA);
  lastFrameTime = timestamp;

  try {
    // 先快照再遍历：回调里可能退订（特效播完、缩略图滚出视口）
    Array.from(subscribers).forEach(callback => {
      try {
        callback(delta);
      } catch (error) {
        // 单个订阅者抛错不能拖垮整条时钟。异常逃出 tick 会让下面的 schedule() 永远不被执行，
        // 表现是「全站画布一起静止」，而控制台只有一条别人的报错，极难联想到是这里
        console.error('[barrage-effect] 画布帧回调异常', error);
      }
    });
  } finally {
    if (subscribers.size > 0) {
      schedule();
    } else {
      // 停循环时归零，下次启动的首帧才是 delta=0
      lastFrameTime = 0;
    }
  }
}

/**
 * 订阅共享时钟
 * @desc 首个订阅者启动循环，最后一个退订时停止
 * @returns 退订函数
 */
export function subscribeCanvasTicker(callback: TickerCallback): () => void {
  subscribers.add(callback);
  schedule();

  return () => {
    subscribers.delete(callback);

    if (subscribers.size === 0 && rafId !== undefined) {
      window.cancelAnimationFrame(rafId);
      rafId = undefined;
      lastFrameTime = 0;
    }
  };
}
