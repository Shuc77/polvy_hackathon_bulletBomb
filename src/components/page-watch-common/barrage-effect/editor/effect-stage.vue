<template>
  <div class="c-effect-stage">
    <div class="c-effect-stage__head">
      <span class="c-effect-stage__title">{{ descriptor?.label ?? '预览' }}</span>
      <span
        class="c-effect-stage__status"
        :class="{ 'is-live': hasVideo }"
      >
        {{ hasVideo ? '已镜像播放器画面' : '等待播放器画面…' }}
      </span>

      <span
        v-if="debug"
        class="c-effect-stage__debug"
      >
        A {{ debug.primary }} · B {{ debug.secondary }} · 条数 {{ debug.count }} · 缝位
        {{ seamPercent }}%
      </span>

      <button
        type="button"
        class="c-effect-stage__replay"
        @click="restart"
      >
        ▶ 重播
      </button>
    </div>

    <mock-barrage-bar
      v-if="isInteractive"
      :words-a="feed?.wordsA"
      :words-b="feed?.wordsB"
    />

    <div class="c-effect-stage__canvas-wrap">
      <canvas
        ref="canvasRef"
        class="c-effect-stage__canvas"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { getEffectTemplate } from '../effects';
import type { AnchorFeed, BarrageAnchor, EffectParams, EffectTemplateName } from '../types';
import { useEffectCanvas, type EffectFrame } from '../use-effect-canvas';
import { useInteractiveDriver, type DriverDebugState } from '../interactive-driver';
import { useBarrageSignalBuffer } from '../barrage-signal';
import { useStageCompositor } from './stage-compositor';
import MockBarrageBar from './mock-barrage-bar.vue';

/** 读数的刷新间隔（毫秒）。4Hz 够看，又不必把每帧的值搬进响应式系统 */
const DEBUG_INTERVAL = 250;

const props = defineProps<{
  template: EffectTemplateName;
  /** 已与模板默认值合并过的最终参数 */
  params: EffectParams;
  /** 选中锚点的驱动配置；没选中锚点时空，按模板默认方式预览 */
  feed?: AnchorFeed;
  /** 选中锚点的 id；变化时重来，让每次改选都从头播一遍 */
  anchorKey?: string;
  /**
   * 密度触发的预览锚点
   * @desc ★ 判定靠**引用变化**，所以工作台每次点击都要换一个新对象
   *   （`createTriggerAnchor` 每次都生成新的 id，引用必然不同）。
   *   **不传 `loop`**：触发锚点恒为 `static` 一次性播放，
   *   预览要和生产逐帧一致，不能这里循环那里不循环
   */
  triggerAnchor?: BarrageAnchor;
}>();

const canvasRef = ref<HTMLCanvasElement>();

const descriptor = computed(() => getEffectTemplate(props.template));

/** 当前画的是真实画面还是占位；同值写入不会触发渲染，可以放心每帧赋 */
const hasVideo = ref(false);

const { drawVideoLayer } = useStageCompositor();

/** 舞台订阅的缓冲与生产层是同一个事件的两个订阅者 —— 这就是「预览即生产」 */
const signalBuffer = useBarrageSignalBuffer();

// 顺序不能倒：下面的 driver 要用 getSize
const { requestDraw, getSize } = useEffectCanvas({
  canvasRef,
  onFrame: renderFrame,
  // 舞台画面大，dpr 放开到 2；缩略图那边才需要压
  dprCap: 2,
  autoStart: true,
});

const driver = useInteractiveDriver({
  getSize,
  getSample: (now, seconds) => signalBuffer.snapshot(now, seconds),
});

/** 尺寸还没量出来时先记着，量到了在下一帧补播 */
let pendingPlay = true;

const debug = ref<DriverDebugState>();

const isInteractive = computed(() => (descriptor.value?.feedModes.length ?? 1) > 1);

const seamPercent = computed(() => Math.round(((debug.value?.bias ?? 0) + 1) * 50));

function currentAnchor(): BarrageAnchor {
  return {
    id: props.anchorKey ?? 'stage-preview',
    time: 0,
    template: props.template,
    params: props.params,
    feed: props.feed,
  };
}

function renderFrame({ ctx, size, delta }: EffectFrame): void {
  hasVideo.value = drawVideoLayer(ctx, size);

  // 第一帧才知道画布多大，所以补播放在这里而不是 setup 里
  if (pendingPlay) {
    pendingPlay = false;
    driver.reset();
    // 生产层只播一次；舞台要一直循环 —— 1.5 秒的动画在你碰滑块之前就结束了
    driver.play(currentAnchor(), { loop: true });
  }

  driver.tick(ctx, delta);
}

/** 重来一遍：换模板、换锚点、手动重播都走它 */
function restart(): void {
  pendingPlay = true;
  requestDraw();
}

watch(
  () => [props.template, props.anchorKey, props.feed?.mode, props.feed?.windowSec].join('|'),
  restart,
);

/**
 * 密度触发预览
 * @desc 与生产层是**同一个 `driver.play(anchor)`**，差别只有画布。
 *   舞台的时钟一直在跑（`autoStart`），所以不像生产层那样需要额外 `start()`
 */
watch(
  () => props.triggerAnchor,
  anchor => {
    if (!anchor) {
      return;
    }

    driver.play(anchor);
    requestDraw();
  },
);

watch(
  () => props.params,
  value => {
    // 走热更新而不是重建：工厂构造时会给每个粒子取随机数，
    // 每拖一下滑块重建一次就是每秒重新随机 60 次，预览会疯狂闪烁
    driver.updateParams(value);
  },
  { deep: true },
);

let debugTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  debugTimer = setInterval(() => {
    debug.value = driver.getDebugState();
  }, DEBUG_INTERVAL);
});

onBeforeUnmount(() => {
  if (debugTimer !== undefined) {
    clearInterval(debugTimer);
  }

  driver.reset();
});
</script>

<style lang="scss">
.c-effect-stage {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.c-effect-stage__head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.c-effect-stage__title {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-effect-stage__status {
  font-size: 11px;
  color: #6d7488;

  &.is-live {
    color: #2ee6a8;
  }
}

.c-effect-stage__debug {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #9aa1b4;
}

.c-effect-stage__replay {
  padding: 4px 12px;
  margin-left: auto;
  font-size: 12px;
  color: #d5dae8;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover {
    border-color: #4f7cff;
  }
}

.c-effect-stage__canvas-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #101319;
  border: 1px solid #262c37;
  border-radius: 8px;
}

.c-effect-stage__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
