/**
 * @file 画布绑定
 * @desc 把一块 canvas 接到共享时钟上，并统一处理 DPR、尺寸变化与「每帧状态卫生」。
 *   有了它，模板作者只需要关心画什么。
 */
import { onBeforeUnmount, ref, type Ref } from 'vue';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';
import { subscribeCanvasTicker } from './canvas-ticker';
import type { EffectSize } from './types';

/** dpr 上限默认值；缩略图这类小画布传更小的值省性能 */
const DEFAULT_DPR_CAP = 2;

export interface EffectFrame {
  ctx: CanvasRenderingContext2D;
  /** CSS 像素尺寸。ctx 已按 dpr 缩放，直接按 CSS 像素坐标绘制即可 */
  size: EffectSize;
  /** 距上一帧的秒数 */
  delta: number;
}

export interface UseEffectCanvasOptions {
  canvasRef: Ref<HTMLCanvasElement | undefined>;
  /**
   * 每帧绘制
   * @desc 契约：进入时画布已清空，且 globalAlpha 为 1、globalCompositeOperation 为 source-over
   */
  onFrame: (frame: EffectFrame) => void;
  /** 尺寸变化回调。特效工厂在构造时固化了尺寸，需要据此重建实例 */
  onSizeChange?: (size: EffectSize) => void;
  /** dpr 上限 */
  dprCap?: number;
  /** 挂载后是否自动开跑 */
  autoStart?: boolean;
}

export const useEffectCanvas = (options: UseEffectCanvasOptions) => {
  const { canvasRef, onFrame, onSizeChange, dprCap = DEFAULT_DPR_CAP, autoStart = false } = options;

  const isRunning = ref(false);

  let ctx: CanvasRenderingContext2D | null = null;
  let unsubscribe: (() => void) | undefined;
  let size: EffectSize = { width: 0, height: 0 };
  let dpr = 1;

  function syncDpr(): boolean {
    const nextDpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const changed = nextDpr !== dpr;

    dpr = nextDpr;

    return changed;
  }

  /** 按缓存的 CSS 尺寸与当前 dpr 重建后台缓冲 */
  function applyBackingSize(canvas: HTMLCanvasElement): void {
    const pixelWidth = Math.max(Math.round(size.width * dpr), 1);
    const pixelHeight = Math.max(Math.round(size.height * dpr), 1);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
  }

  /**
   * 同步画布尺寸
   * @returns CSS 尺寸是否变化（dpr 单独处理，它变化时不需要重建特效实例）
   */
  function syncSize(): boolean {
    const canvas = canvasRef.value;
    if (!canvas) {
      return false;
    }

    const rect = canvas.getBoundingClientRect();
    const sizeChanged =
      Math.round(size.width) !== Math.round(rect.width) ||
      Math.round(size.height) !== Math.round(rect.height);

    size = { width: rect.width, height: rect.height };
    syncDpr();
    applyBackingSize(canvas);

    if (!ctx || ctx.canvas !== canvas) {
      ctx = canvas.getContext('2d');
    }

    return sizeChanged;
  }

  /**
   * 每帧状态卫生
   * @desc 这是整个 composable 最值钱的部分：模板不必各自记得复位，
   *   而 shockwave 恰好会把 globalAlpha 停在最后一个粒子的值上不还原
   */
  function prepareFrame(context: CanvasRenderingContext2D): void {
    // dpr 可能在窗口尺寸没变的情况下变了（拖到不同缩放的显示器），每帧核对一次成本极低
    if (syncDpr()) {
      applyBackingSize(context.canvas);
    }

    // 给 canvas.width / height 赋值会重置上下文状态，所以顺序必须是「先定尺寸，再建坐标系」
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, size.width, size.height);
  }

  function drawFrame(delta: number): void {
    if (!ctx) {
      return;
    }

    prepareFrame(ctx);
    onFrame({ ctx, size, delta });
  }

  function stop(): void {
    isRunning.value = false;
    unsubscribe?.();
    unsubscribe = undefined;
  }

  function start(): void {
    if (isRunning.value) {
      return;
    }

    syncSize();
    isRunning.value = true;
    unsubscribe = subscribeCanvasTicker(drawFrame);
  }

  /**
   * 只画一帧，不开循环
   * @desc 尺寸变化后、舞台暂停时、生产层挂载时的空白绘制都用它
   */
  function requestDraw(): void {
    syncSize();
    drawFrame(0);
  }

  function getSize(): EffectSize {
    return size;
  }

  // 网页全屏不触发 window.resize，画布不会自动跟上，靠它兜住
  useResizeObserver(canvasRef, () => {
    if (syncSize()) {
      onSizeChange?.(size);
    }

    // 循环没跑时也要重绘，否则调整尺寸后画面停在旧的一帧
    if (!isRunning.value) {
      drawFrame(0);
    }
  });

  if (autoStart) {
    start();
  }

  onBeforeUnmount(stop);

  return {
    isRunning,
    start,
    stop,
    requestDraw,
    getSize,
  };
};
