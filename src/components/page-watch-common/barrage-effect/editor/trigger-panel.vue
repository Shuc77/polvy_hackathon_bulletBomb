<template>
  <div class="c-trigger-panel">
    <div class="c-trigger-panel__head">
      <label class="c-trigger-panel__switch">
        <input
          :checked="config.enabled"
          type="checkbox"
          @change="onEnabledChange"
        />
        <span>弹幕够热闹就自动放一个</span>
      </label>
      <span class="c-trigger-panel__hint">
        直播没有时间轴，锚点触发永远不会命中 —— 密度触发是直播下唯一能自动触发的方式；
        想手动放一个，到「实时特效」里点一下模板
      </span>
    </div>

    <div class="c-trigger-panel__field">
      <div class="c-trigger-panel__label">
        <span>触发模板</span>
        <b>{{ currentTemplate?.label }}</b>
      </div>
      <div class="c-trigger-panel__chips">
        <button
          v-for="item in EFFECT_TEMPLATES"
          :key="item.name"
          type="button"
          class="c-trigger-panel__chip"
          :class="{ 'is-active': item.name === config.template }"
          @click="patch({ template: item.name })"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="c-trigger-panel__row">
      <div class="c-trigger-panel__field">
        <div class="c-trigger-panel__label">
          <span>统计窗口</span>
          <b>{{ config.windowSec }} 秒</b>
        </div>
        <plv-slider
          :value="config.windowSec"
          :min="MIN_DENSITY_WINDOW_SEC"
          :max="MAX_DENSITY_WINDOW_SEC"
          :progress-bar-visible="false"
          :hot-area-height="26"
          @input="onWindowSecInput"
        />
      </div>

      <div class="c-trigger-panel__field">
        <div class="c-trigger-panel__label">
          <span>阈值</span>
          <b>{{ config.threshold }} 条</b>
        </div>
        <plv-slider
          :value="config.threshold"
          :min="MIN_DENSITY_THRESHOLD"
          :max="MAX_DENSITY_THRESHOLD"
          :progress-bar-visible="false"
          :hot-area-height="26"
          @input="onThresholdInput"
        />
      </div>
    </div>

    <div class="c-trigger-panel__field">
      <div class="c-trigger-panel__label">
        <span>冷却</span>
        <b>{{ config.cooldownSec }} 秒</b>
      </div>
      <plv-slider
        :value="config.cooldownSec"
        :min="MIN_DENSITY_COOLDOWN_SEC"
        :max="MAX_DENSITY_COOLDOWN_SEC"
        :progress-bar-visible="false"
        :hot-area-height="26"
        @input="onCooldownInput"
      />
      <p class="c-trigger-panel__note">
        冷却不是可选项：阈值之上每来一条都放，观众刷起来就是一秒一个。
      </p>
    </div>

    <div
      class="c-trigger-panel__meter"
      :class="{ 'is-armed': state?.armed }"
    >
      <span class="c-trigger-panel__meter-main">
        窗内 {{ state?.count ?? 0 }} / {{ config.threshold }} 条
      </span>
      <span class="c-trigger-panel__meter-sub">
        {{
          !config.enabled
            ? '未开启'
            : (state?.cooldownRemaining ?? 0) > 0
            ? `冷却中 ${(state?.cooldownRemaining ?? 0).toFixed(1)}s`
            : state?.armed
            ? '已达阈值，下一条弹幕就会触发'
            : '未达阈值'
        }}
      </span>
    </div>

    <div class="c-trigger-panel__actions">
      <button
        type="button"
        @click="burst()"
      >
        注入 8 条弹幕
      </button>
      <button
        type="button"
        class="is-primary"
        @click="emit('preview')"
      >
        预览一次
      </button>
      <span class="c-trigger-panel__hint">
        预览只跳过阈值与冷却，放出来的东西与自动触发完全一致
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
// 见 params-panel.vue 里的说明：polyv-ui 没有全局注册，模板里用到就得显式引入
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { EFFECT_TEMPLATES, getEffectTemplate } from '../effects';
import { useBarrageSignalBuffer } from '../barrage-signal';
import {
  MAX_DENSITY_COOLDOWN_SEC,
  MAX_DENSITY_THRESHOLD,
  MAX_DENSITY_WINDOW_SEC,
  MIN_DENSITY_COOLDOWN_SEC,
  MIN_DENSITY_THRESHOLD,
  MIN_DENSITY_WINDOW_SEC,
  readDensityState,
  type DensityState,
  type DensityTriggerConfig,
} from '../density-trigger';
import { useMockBarrage } from './mock-barrage';

/** 读数刷新间隔（毫秒）。冷却在走秒，4Hz 看着才不像卡住 */
const TICK = 250;

/** 一次注入多少条。正好等于默认阈值 —— 注一次就够到线，方便对着调 */
const BURST_COUNT = 8;

const emit = defineEmits<{
  (e: 'preview'): void;
}>();

const barrageEffectStore = useBarrageEffectStore();
const { density: config } = storeToRefs(barrageEffectStore);

/** 预览用不着关键词：注入的是兜底词，演示的是「量」，不是「派」 */
const { burst: sendBurst } = useMockBarrage(() => ({}));

/** 本面板自持一份缓冲。作者要能看到「现在窗内有几条」，否则阈值只能瞎填 */
const signalBuffer = useBarrageSignalBuffer();

const state = ref<DensityState>();

const currentTemplate = computed(() => getEffectTemplate(config.value.template));

function patch(next: Partial<DensityTriggerConfig>): void {
  barrageEffectStore.updateDensity(next);
}

function onEnabledChange(event: Event): void {
  patch({ enabled: (event.target as HTMLInputElement).checked });
}

/**
 * 三个滑块的回调
 * @desc ★ 必须写成具名方法，**不能在模板里写带类型标注的内联箭头** ——
 *   vue-tsc 认（它走的是自己的模板编译管线），但 vue-loader 用的 Vue 2.7 模板编译器
 *   会直接报 `invalid expression: Unexpected token ':'`，整个 webpack 构建失败。
 *   这是个只会在跑起来时炸的坑：`npm run check` 一路绿灯
 */
function onWindowSecInput(value: number): void {
  patch({ windowSec: value });
}

function onThresholdInput(value: number): void {
  patch({ threshold: value });
}

function onCooldownInput(value: number): void {
  patch({ cooldownSec: value });
}

function burst(): void {
  sendBurst(BURST_COUNT, 0.5);
}

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    const now = performance.now();
    const cfg = config.value;

    state.value = readDensityState(
      signalBuffer.snapshot(now, cfg.windowSec),
      cfg,
      barrageEffectStore.lastFiredAt,
      now,
    );
  }, TICK);
});

onBeforeUnmount(() => {
  if (timer !== undefined) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss">
.c-trigger-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.c-trigger-panel__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.c-trigger-panel__switch {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: #e8eaf0;
  cursor: pointer;

  input {
    width: 14px;
    height: 14px;
    accent-color: #4f7cff;
    cursor: pointer;
  }
}

.c-trigger-panel__hint {
  font-size: 10px;
  color: #5d6478;
}

.c-trigger-panel__field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.c-trigger-panel__row {
  display: flex;
  gap: 14px;
}

.c-trigger-panel__label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9aa1b4;

  b {
    font-variant-numeric: tabular-nums;
    color: #cdd6f0;
  }
}

.c-trigger-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.c-trigger-panel__chip {
  padding: 4px 10px;
  font-size: 11px;
  color: #9aa1b4;
  cursor: pointer;
  background: #232936;
  border: 1px solid #3d4658;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    border-color: #4f7cff;
  }

  &.is-active {
    color: #fff;
    background: #4f7cff;
    border-color: #4f7cff;
  }
}

.c-trigger-panel__meter {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: 11px;
  color: #9aa1b4;
  background: #12151b;
  border: 1px solid #262c37;
  border-radius: 4px;

  &.is-armed {
    color: #2ee6a8;
    border-color: rgba(#2ee6a8, 0.5);
  }
}

.c-trigger-panel__meter-main {
  font-variant-numeric: tabular-nums;
}

.c-trigger-panel__meter-sub {
  color: inherit;
}

.c-trigger-panel__actions {
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    padding: 6px 14px;
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

    &.is-primary {
      color: #fff;
      background: #4f7cff;
      border-color: #4f7cff;
    }
  }
}

.c-trigger-panel__note {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #5d6478;
}
</style>
