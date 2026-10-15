<template>
  <div class="c-params-panel">
    <div class="c-params-panel__head">特效参数</div>

    <div
      v-if="!anchor"
      class="c-params-panel__empty"
    >
      点击时间轴上的标记编辑已有特效，
      <br />
      或从左侧把模板拖到时间轴上新增一个。
    </div>

    <template v-else>
      <div class="c-params-panel__field">
        <div class="c-params-panel__label">触发时间</div>
        <div class="c-params-panel__row">
          <plv-input-number
            :value="anchor.time"
            :min="0"
            :max="Math.max(duration, 0)"
            :step="1"
            @change="onTimeChange"
          />
          <button
            type="button"
            class="c-params-panel__ghost-btn"
            :disabled="!isTimeAxisAvailable"
            @click="emit('use-current-time')"
          >
            取当前位置
          </button>
        </div>
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">模板</div>
        <plv-select
          :value="anchor.template"
          :options="EFFECT_TEMPLATE_OPTIONS"
          @change="onTemplateChange"
        />
      </div>

      <!-- 放在模板下面：先选「是什么特效」，再选「怎么被驱动」。
           feed-panel 自己判断模板支不支持互动，纯转场不会出现 -->
      <feed-panel
        :anchor="anchor"
        @patch="onFeedPatch"
      />

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">配色</div>
        <div class="c-params-panel__row">
          <plv-color-picker
            :value="colorPrimary"
            @change="onPrimaryChange"
          />
          <plv-color-picker
            :value="colorSecondary"
            @change="onSecondaryChange"
          />
        </div>
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">
          <span>粒子数量</span>
          <b>{{ particles }}</b>
        </div>
        <plv-slider
          :value="particles"
          :min="MIN_PARTICLES"
          :max="MAX_PARTICLES"
          :step="10"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onParticlesInput"
        />
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">
          <span>主色占比</span>
          <b>{{ ratioPercent }}%</b>
        </div>
        <plv-slider
          :value="ratioPercent"
          :min="0"
          :max="100"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onRatioInput"
        />
      </div>

      <div class="c-params-panel__field">
        <div class="c-params-panel__label">
          <span>重心偏向</span>
          <b>{{ biasText }}</b>
        </div>
        <plv-slider
          :value="biasPercent"
          :min="-100"
          :max="100"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onBiasInput"
        />
      </div>

      <button
        type="button"
        class="c-params-panel__remove"
        @click="emit('remove')"
      >
        删除该特效
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EFFECT_TEMPLATE_OPTIONS, getEffectTemplate } from '../effects';
import type { BarrageAnchor, EffectParams, EffectTemplateName } from '../types';
import FeedPanel from './feed-panel.vue';

/** 粒子数的上下限：低于 20 看不出形状，高于 280 在小画布上糊成一片 */
const MIN_PARTICLES = 20;
const MAX_PARTICLES = 280;

const props = defineProps<{
  anchor?: BarrageAnchor;
  duration: number;
  isTimeAxisAvailable: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'patch',
    patch: Partial<BarrageAnchor>,
    opts?: {
      /** 滑块这类高频写入：让 store 跳过重排并把落盘合并到尾部 */
      defer?: boolean;
    },
  ): void;
  (e: 'remove'): void;
  (e: 'use-current-time'): void;
}>();

const descriptor = computed(() =>
  props.anchor ? getEffectTemplate(props.anchor.template) : undefined,
);

/** 锚点参数与模板默认值合并后的最终值 —— 和舞台预览的是同一份 */
const resolved = computed<EffectParams>(() => ({
  ...descriptor.value?.defaults,
  ...props.anchor?.params,
}));

const colorPrimary = computed(() => resolved.value.colorPrimary ?? '#ff3553');
const colorSecondary = computed(() => resolved.value.colorSecondary ?? '#ffd166');

const particles = computed(() => resolved.value.particles ?? 120);
const ratioPercent = computed(() => Math.round((resolved.value.ratio ?? 0.5) * 100));
const biasPercent = computed(() => Math.round((resolved.value.bias ?? 0) * 100));

const biasText = computed(() => {
  const value = biasPercent.value;

  if (value === 0) {
    return '居中';
  }

  return value < 0 ? `左 ${-value}%` : `右 ${value}%`;
});

/**
 * 写回参数
 * @desc 写的是**合并后的全量**而不是单个字段：从地址栏导入的锚点 `params` 可能是空的，
 *   只写差异的话，导出时就得到一份缺字段的配置
 */
function patchParams(patch: EffectParams, defer = true): void {
  if (!props.anchor) {
    return;
  }

  emit('patch', { params: { ...resolved.value, ...patch } }, { defer });
}

function onTimeChange(value: number | string): void {
  const time = Number(value);

  emit('patch', { time: Math.max(0, Math.round(Number.isFinite(time) ? time : 0)) });
}

function onTemplateChange(name: EffectTemplateName): void {
  // 换模板时清空参数：带着上一个模板的参数会让新模板长得像"选错了"
  emit('patch', { template: name, params: {} });
}

function onPrimaryChange(color: string): void {
  patchParams({ colorPrimary: color });
}

function onSecondaryChange(color: string): void {
  patchParams({ colorSecondary: color });
}

function onParticlesInput(value: number): void {
  patchParams({ particles: Math.round(value) });
}

function onRatioInput(value: number): void {
  patchParams({ ratio: value / 100 });
}

function onBiasInput(value: number): void {
  patchParams({ bias: value / 100 });
}

/**
 * 驱动配置的改动
 * @desc 刻意**不带 defer**：选模式、填关键词都是低频操作，
 *   即时落盘更符合预期 —— 改完顺手刷一下页面也不该丢
 */
function onFeedPatch(patch: Partial<BarrageAnchor>): void {
  emit('patch', patch);
}
</script>

<style lang="scss">
.c-params-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.c-params-panel__head {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-params-panel__empty {
  padding: 24px 12px;
  font-size: 12px;
  line-height: 1.8;
  color: #6d7488;
  text-align: center;
  border: 1px dashed #343a49;
  border-radius: 6px;
}

.c-params-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.c-params-panel__label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 12px;
  color: #9aa1b4;

  b {
    font-weight: 600;
    color: #cdd6f0;
  }
}

.c-params-panel__row {
  display: flex;
  gap: 8px;
}

.c-params-panel__ghost-btn {
  flex-shrink: 0;
  padding: 0 10px;
  font-size: 12px;
  color: #d5dae8;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: #4f7cff;
  }

  &:disabled {
    color: #5d6478;
    cursor: not-allowed;
  }
}

.c-params-panel__remove {
  padding: 7px 0;
  margin-top: 4px;
  font-size: 12px;
  color: #ff8b8b;
  cursor: pointer;
  background: rgba(#ff6b6b, 0.08);
  border: 1px solid rgba(#ff6b6b, 0.4);
  border-radius: 4px;
  transition: background 0.15s;

  &:hover {
    background: rgba(#ff6b6b, 0.16);
  }
}

/**
 * 后台组件自带浅色皮肤，这里统一压深，免得三栏里嵌进几块白。
 * 用 .c-params-panel 收口，不会漏到工作台外面去。
 */
.c-params-panel {
  .plv-input__main {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-input__main__input,
  .plv-input__main__input__inner {
    color: #e8eaf0;
    background: transparent;

    &::placeholder {
      color: #5d6478;
    }
  }

  .plv-input-number__controls__increase,
  .plv-input-number__controls__decrease {
    color: #9aa1b4;
  }

  .plv-select__body {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-select__body__input {
    color: #e8eaf0;
  }

  .plv-color-picker__body {
    background: #232936;
    border-color: #3d4658;
  }

  .plv-color-picker__body__input {
    color: #e8eaf0;
    background: transparent;
  }

  .plv-slider__runway {
    background: #2c3243;
  }

  .plv-slider__runway__bar {
    background: #4f7cff;
  }

  .plv-slider__button__inner {
    background-color: #4f7cff;
    border-color: #4f7cff;
  }
}
</style>
