<template>
  <button
    type="button"
    class="c-template-card"
    :class="{
      'c-template-card--selected': selected,
      'c-template-card--dragging': dragging,
    }"
    @click="onClick"
    @mousedown="onPointerDown"
    @touchstart="onPointerDown"
  >
    <span class="c-template-card__thumb">
      <canvas
        ref="canvasRef"
        class="c-template-card__canvas"
      />

      <i
        class="c-template-card__grip"
        aria-hidden="true"
      >
        <span
          v-for="dot in 6"
          :key="dot"
        />
      </i>
    </span>

    <span class="c-template-card__body">
      <em class="c-template-card__label">{{ template.label }}</em>
      <em class="c-template-card__desc">{{ template.description }}</em>

      <!-- 分组标题已经说了类别，卡片上更有价值的是「能怎么被驱动」。
           ★ 标出**拖进去会用哪一种** —— 列表里几个标签以前长得一模一样，
             作者把「红蓝对抗」拖进时间轴，得到的可能是对冲也可能是规模，
             而卡片上完全看不出来 -->
      <span class="c-template-card__modes">
        <i
          v-for="chip in modeChips"
          :key="chip.mode"
          class="c-template-card__mode"
          :class="{ 'c-template-card__mode--default': chip.isDefault }"
          :title="
            chip.isDefault
              ? `拖入时间轴时默认用「${chip.label}」`
              : `拖入后可切换为「${chip.label}」`
          "
          >{{ chip.label }}</i
        >
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { EffectInstance, EffectTemplateDescriptor } from '../types';
import { FEED_MODE_LABELS, isTransitionOnly } from '../effects';
import { useEffectCanvas, type EffectFrame } from '../use-effect-canvas';
import { beginTemplateDrag, shouldSuppressDragClick, useTemplateDrag } from './use-template-drag';

/** 缩略图统一压到 60 个粒子：6 块画布同时跑，默认值（多为 180）纯属浪费 */
const THUMBNAIL_PARTICLES = 60;

/** 缩略图的 dpr 上限，比生产层的 2 低一档 */
const THUMBNAIL_DPR_CAP = 1.5;

/** 两轮动画之间的停顿（秒）；不留停顿读起来是频闪不是循环 */
const LOOP_GAP = 0.32;

/** 相邻卡片的起跑错峰（秒）。没有它六块缩略图会整齐地一起炸，像坏掉的幻灯片 */
const STAGGER_STEP = 0.22;

const props = defineProps<{
  template: EffectTemplateDescriptor;
  selected: boolean;
  /** 在列表里的序号，用于错峰 */
  index: number;
}>();

const emit = defineEmits<{ (e: 'select'): void }>();

const { draggingTemplate } = useTemplateDrag();

const canvasRef = ref<HTMLCanvasElement>();

const dragging = computed(
  () => draggingTemplate.value !== undefined && draggingTemplate.value === props.template.name,
);

/**
 * 能力标签：转场类直说「与弹幕无关」，互动类列出支持哪几种驱动
 * @desc `isDefault` 标的是那一种「拖进去就直接在用」的方式 ——
 *   它来自 `defaultFeedMode`，与 `addAnchorAt` 写入锚点的是**同一个字段**，
 *   所以卡片上高亮的那个，就是拖进去以后右侧面板显示的那个
 */
const modeChips = computed(() => {
  if (isTransitionOnly(props.template)) {
    return [{ mode: 'static', label: '与弹幕无关', isDefault: false }];
  }

  return props.template.feedModes
    .filter(mode => mode !== 'static')
    .map(mode => ({
      mode,
      label: FEED_MODE_LABELS[mode],
      isDefault: mode === props.template.defaultFeedMode,
    }));
});

let instance: EffectInstance | undefined;
/** 距下一次开跑的剩余秒数，兼作「首轮错峰」的倒计时 */
let gapRemaining = 0;
let seeded = false;

function onFrame({ ctx, delta }: EffectFrame): void {
  if (!instance) {
    gapRemaining -= delta;

    if (gapRemaining > 0) {
      return;
    }

    spawn();

    if (!instance) {
      gapRemaining = 0.1;
      return;
    }
  }

  instance.update(delta);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  instance.draw(ctx);
  ctx.restore();

  if (instance.finished) {
    // 每轮重新取随机粒子，缩略图看起来是「活的」而不是一张循环 GIF
    instance = undefined;
    gapRemaining = LOOP_GAP;
  }
}

const { start, stop, getSize } = useEffectCanvas({
  canvasRef,
  onFrame,
  dprCap: THUMBNAIL_DPR_CAP,
});

/** 放在 useEffectCanvas 之后：它要用的 getSize 来自上面那次调用 */
function spawn(): void {
  const size = getSize();

  if (size.width <= 0 || size.height <= 0) {
    // 尺寸还没量出来，下一帧再试
    return;
  }

  // ★ `thumbnailParams` 必须并进来，而且要在 `particles` 之前。
  //   它是「缩略图这种场合下参数的覆盖」—— 倒计时的 defaults 是 300 秒，
  //   不覆盖的话卡片会钉死在 05:00，永远走不到下面那个 finished 分支。
  //   `particles` 恒排最后：卡片有十几张同时在跑，粒子上限不能由模板决定
  instance = props.template.factory(
    {
      ...props.template.defaults,
      ...props.template.thumbnailParams,
      particles: THUMBNAIL_PARTICLES,
    },
    size,
  );
}

let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (!seeded) {
    seeded = true;
    gapRemaining = props.index * STAGGER_STEP;
  }

  const canvas = canvasRef.value;

  // 滚出视野就停：六块画布一起空转是白烧 CPU
  if (!canvas || typeof IntersectionObserver === 'undefined') {
    start();
    return;
  }

  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
  });

  observer.observe(canvas);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  instance = undefined;
});

function onPointerDown(event: MouseEvent | TouchEvent): void {
  beginTemplateDrag(props.template.name, event);
}

function onClick(): void {
  // 从这张卡片拖出去再松手，浏览器可能补发一次 click
  if (shouldSuppressDragClick()) {
    return;
  }

  emit('select');
}
</script>

<style lang="scss">
$accent: #4f7cff;

.c-template-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  text-align: left;
  cursor: grab;
  background: #1b1f27;
  border: 1px solid #2a303c;
  border-radius: 8px;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: #1f242e;
    border-color: #3d4658;
  }
}

.c-template-card--selected {
  background: rgba($accent, 0.09);
  border-color: $accent;
}

.c-template-card--dragging {
  cursor: grabbing;
  border-color: $accent;
  opacity: 0.55;
}

.c-template-card__thumb {
  position: relative;
  display: block;
  height: 76px;
  overflow: hidden;
  background: #101319;
  border-radius: 5px;
}

.c-template-card__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* 右上角的六点抓手，告诉用户「这张卡可以拖」 */
.c-template-card__grip {
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  grid-template-columns: repeat(2, 2px);
  gap: 2px;
  opacity: 0.45;

  span {
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
  }
}

.c-template-card__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.c-template-card__label {
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  color: #e8eaf0;
}

/* 固定两行高：卡片高度必须一致，否则右侧列表会参差不齐 */
.c-template-card__desc {
  max-height: 33px;
  overflow: hidden;
  font-size: 11px;
  font-style: normal;
  line-height: 1.5;
  color: #7c8398;
}

.c-template-card__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  /* 固定高度：有标签和没标签的卡片得一样高 */
  min-height: 15px;
}

.c-template-card__mode {
  padding: 1px 6px;
  font-size: 10px;
  font-style: normal;
  line-height: 1.4;
  color: #8f97ab;
  background: #262b36;
  border-radius: 8px;
}

/**
 * 「拖进去默认就是这个」
 * @desc 用正面填充而不是加粗/加亮：卡片缩略图本身已经很花了，
 *   文字粗细的变化在那上面读不出来，颜色块能
 */
.c-template-card__mode--default {
  color: #dbe4ff;
  background: rgba($accent, 0.32);
}

.c-template-card--selected .c-template-card__mode {
  color: #cdd6f0;
  background: rgba($accent, 0.22);
}

/* 选中态那条是 0-2-0，会把「默认」的高亮（0-1-0）盖掉 —— 补一条更高的 */
.c-template-card--selected .c-template-card__mode--default {
  color: #fff;
  background: rgba($accent, 0.55);
}
</style>
