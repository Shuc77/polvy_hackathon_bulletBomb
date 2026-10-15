<!-- @file PC 端弹幕特效层 -->
<template>
  <div class="c-pc-barrage-effect">
    <canvas
      ref="canvasRef"
      class="c-pc-barrage-effect__canvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { useEffectCanvas, type EffectFrame } from './use-effect-canvas';
import { useAnchorScheduler } from './use-anchor-scheduler';
import { createSignalBuffer, useBarrageSignalListener } from './barrage-signal';
import { createTriggerAnchor, evaluateDensity } from './density-trigger';
import { useInteractiveDriver } from './interactive-driver';
import type { BarrageAnchor } from './types';

const canvasRef = ref<HTMLCanvasElement>();

const barrageEffectStore = useBarrageEffectStore();

/** 真实上屏弹幕的时间窗缓冲，由本实例自持 */
const signalBuffer = createSignalBuffer();

// 顺序不能倒：下面的 driver 要用 getSize
const { start, stop, requestDraw, getSize } = useEffectCanvas({
  canvasRef,
  onFrame: renderFrame,
  onSizeChange: () => {
    // 尺寸回调只可能由 ResizeObserver 的**异步**回调触发，走到这里 driver 必然已赋值
    // （`use-resize-observer` 里是 `observer.observe()`，首次回调也排在当前同步代码之后）
    // eslint-disable-next-line no-use-before-define
    driver.invalidate();
    // 先停掉再画一帧：这一帧里驱动器会告诉我们还有没有东西要画
    stop();
    requestDraw();
  },
});

const driver = useInteractiveDriver({
  getSize,
  getSample: (now, seconds) => signalBuffer.snapshot(now, seconds),
});

function renderFrame({ ctx, delta }: EffectFrame): void {
  // start() 是幂等的（已在跑就早退），所以这里可以每帧无脑调用。
  //
  // ★ 判据必须是驱动器「还有没有轨道」而不是「有没有活着的实例」：
  //   窗内循环的间隙里实例是空的，按实例判会把共享 rAF 停掉，
  //   而停了就再也没有下一帧去结束间隙 —— 窗从此冻住
  if (driver.tick(ctx, delta)) {
    start();
    return;
  }

  stop();
}

/**
 * 放一个特效并确保时钟在跑
 *
 * @desc `start()` 不能省：触发是事件驱动的，此刻共享 rAF 多半是停的
 *   （没有东西在播时它引用计数归零会 `cancelAnimationFrame`）。
 *   只 play 不 start，特效会静静地挂在轨道上永远不画出来。
 *
 *   ★ 顺序也必须是「先 start 后 play」：`start()` 内部会 `syncSize()` 把画布尺寸量出来，
 *   而 `driver.play()` 拿不到有效尺寸就直接早退。反过来的话，这块画布第一次被触发时
 *   尺寸还是 0，这次触发会被**静默丢掉**（没有日志，看起来就像密度判定没生效）。
 *   先起循环不影响这一帧：`subscribeCanvasTicker` 是 rAF，play 一定排在下一帧之前
 */
function playAndRun(anchor: BarrageAnchor): void {
  start();
  driver.play(anchor);
}

useAnchorScheduler({
  // 从 store 实时读取：配置面板里增删锚点后无需刷新即可生效
  getAnchors: () => barrageEffectStore.anchors,
  onHit: playAndRun,
  // 工作台浮层盖住播放器时，真实图层上放特效没人看得见
  shouldSuppress: () => barrageEffectStore.workbenchVisible,
});

/**
 * 弹幕到达：先入缓冲，再判密度
 *
 * @desc 两件事**在同一个回调里按顺序做**，不是两个订阅各做各的。
 *   分成两个订阅就要依赖 emitter 按注册顺序回调，密度判定可能读到
 *   还没把这条消息算进去的快照 —— 阈值于是变成「比配置多一条」。
 *   顺序写死在这里，这个不确定性就不存在了。
 */
useBarrageSignalListener(signal => {
  signalBuffer.push(signal);

  // 工作台开着时不炸：作者正在浮层里调参，特效会在看不见的地方被消耗掉
  if (barrageEffectStore.workbenchVisible) {
    return;
  }

  const config = barrageEffectStore.density;
  const now = performance.now();

  if (
    !evaluateDensity(
      signalBuffer.snapshot(now, config.windowSec),
      config,
      barrageEffectStore.lastFiredAt,
      now,
    )
  ) {
    return;
  }

  // ★ 先记冷却再放。放的过程中消息还在进，顺序反了会在同一批里连放好几次
  barrageEffectStore.markDensityFired(now);
  playAndRun(createTriggerAnchor(config));
});

onMounted(() => {
  // 先把尺寸量出来，playAnchor 才拿得到有效画布大小
  requestDraw();

  if (barrageEffectStore.anchors.length > 0) {
    console.info('[barrage-effect] 已加载时间锚点', barrageEffectStore.anchors);
  }
});

onBeforeUnmount(() => {
  driver.reset();
});
</script>

<style lang="scss">
.c-pc-barrage-effect {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.c-pc-barrage-effect__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
