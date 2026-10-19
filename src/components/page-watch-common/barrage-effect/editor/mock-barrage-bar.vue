<template>
  <div class="c-mock-barrage">
    <span class="c-mock-barrage__title">模拟弹幕</span>

    <button
      type="button"
      class="c-mock-barrage__btn"
      :disabled="!enabled"
      @click="sendOne('primary')"
    >
      +1 {{ primaryWord }}
    </button>
    <button
      type="button"
      class="c-mock-barrage__btn"
      :disabled="!enabled"
      @click="sendOne('secondary')"
    >
      +1 {{ secondaryWord }}
    </button>

    <div
      class="c-mock-barrage__ratio"
      :class="{ 'c-mock-barrage__ratio--off': !enabled }"
    >
      <span class="c-mock-barrage__ratio-label">A 派占比</span>
      <!-- ★ 跟着 enabled 一起置灰：按钮灰着而滑块还能拖，是在暗示
           「拖它能改变什么」—— 而静态驱动下它什么也改变不了 -->
      <plv-slider
        :value="ratioPercent"
        :min="0"
        :max="100"
        :disabled="!enabled"
        :progress-bar-visible="false"
        :hot-area-height="24"
        @input="onRatioInput"
      />
      <b class="c-mock-barrage__ratio-value">{{ ratioPercent }}%</b>
    </div>

    <button
      type="button"
      class="c-mock-barrage__btn"
      :disabled="!enabled"
      @click="onBurst"
    >
      连发 8 条
    </button>

    <!-- 持续刷屏：真实直播里弹幕是源源不断的，
         「连发 8 条」按一下停一下，看不出持续运行下的密度与帧率 -->
    <button
      type="button"
      class="c-mock-barrage__btn c-mock-barrage__btn--stream"
      :class="{ 'is-streaming': streaming }"
      :disabled="!enabled"
      @click="toggleStream"
    >
      <i
        v-if="streaming"
        class="c-mock-barrage__pulse"
      />
      {{ streaming ? '停止刷屏' : '持续刷屏' }}
    </button>
    <span class="c-mock-barrage__rate">{{ RATE_PER_SEC }} 条/秒</span>

    <!-- ★ 说清楚「为什么点了没反应」。这条不解释，作者只会以为按钮坏了 -->
    <span
      class="c-mock-barrage__hint"
      :class="{ 'c-mock-barrage__hint--warn': !enabled }"
    >
      {{
        enabled
          ? '与真实弹幕同一个入口'
          : '当前驱动方式是「静态」，特效不读弹幕 —— 到右侧把它切成互动方式后这里才有反应'
      }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
// 见 params-panel.vue 里的说明：polyv-ui 没有全局注册，模板里用到就得显式引入
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { FALLBACK_WORDS, useMockBarrage } from './mock-barrage';
import { parseKeywords } from '../feed-window';

/** 一次连发多少条 */
const BURST_COUNT = 8;

/**
 * 刷屏速率，每秒几条
 * @desc 3 条/秒 × 默认 6 秒收集窗 ≈ 18 条，大约是满规模（40~60）的三到四成 ——
 *   够看出「规模」通道在动，又不会一开就顶满看不出变化
 */
const RATE_PER_SEC = 3;

const props = withDefaults(
  defineProps<{
    wordsA?: string;
    wordsB?: string;
    /**
     * 当前锚点的驱动方式是不是互动的
     * @desc ★ 由 `effect-stage.vue` 用 `resolveFeedMode` 算好传进来 —— 判据必须和
     *   驱动器同源。为 false 时按钮点下去不会有任何可见效果（信号发出去了，
     *   但没有轨道订阅它），所以置灰并说明原因
     */
    enabled?: boolean;
  }>(),
  { enabled: true },
);

const ratioPercent = ref(50);

const { sendOne, burst } = useMockBarrage(() => ({
  wordsA: props.wordsA,
  wordsB: props.wordsB,
}));

/** 按钮上显示实际用的词，作者一眼看得出关键词配没配对 */
function firstWord(raw: string | undefined, fallback: string): string {
  return parseKeywords(raw)[0] ?? fallback;
}

const primaryWord = computed(() => firstWord(props.wordsA, FALLBACK_WORDS.primary));
const secondaryWord = computed(() => firstWord(props.wordsB, FALLBACK_WORDS.secondary));

function onRatioInput(value: number): void {
  ratioPercent.value = value;
}

function onBurst(): void {
  burst(BURST_COUNT, ratioPercent.value / 100);
}

/** 是否正在持续刷屏 */
const streaming = ref(false);

let streamTimer: ReturnType<typeof setInterval> | undefined;

function stopStream(): void {
  if (streamTimer !== undefined) {
    clearInterval(streamTimer);
    streamTimer = undefined;
  }

  streaming.value = false;
}

/**
 * 开 / 关持续刷屏
 * @desc 复用 `sendOne`，所以每一条走的还是**与生产同一个入口**；
 *   这里只是换了个「谁来按」—— 之前是手，现在是定时器
 */
function toggleStream(): void {
  if (streaming.value) {
    stopStream();
    return;
  }

  streaming.value = true;
  streamTimer = setInterval(() => {
    sendOne(Math.random() < ratioPercent.value / 100 ? 'primary' : 'secondary');
  }, 1000 / RATE_PER_SEC);
}

/**
 * 驱动方式被切成静态时自动停
 * @desc ★ 按钮置灰只管住「点不点得动」，管不住已经在跑的定时器。
 *   不停的话它会在后台继续往总线里灌信号：密度触发照样会被点着，
 *   而作者看着一个灰掉的按钮，只会以为系统疯了
 */
watch(
  () => props.enabled,
  value => {
    if (!value) {
      stopStream();
    }
  },
);

onBeforeUnmount(stopStream);
</script>

<style lang="scss">
.c-mock-barrage {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  background: #171a21;
  border: 1px solid #262c37;
  border-radius: 6px;
}

.c-mock-barrage__title {
  font-size: 11px;
  font-weight: 600;
  color: #9aa1b4;
}

.c-mock-barrage__btn {
  padding: 4px 10px;
  font-size: 11px;
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
    border-color: #2f3542;
  }
}

.c-mock-barrage__ratio {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 200px;

  &.c-mock-barrage__ratio--off {
    opacity: 0.45;
  }
}

.c-mock-barrage__ratio-label {
  font-size: 11px;
  color: #7c8398;
  white-space: nowrap;
}

.c-mock-barrage__ratio-value {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #cdd6f0;
}

/* 刷屏中：边框和文字都转成活色，加一颗呼吸的点 —— 「它现在真的在跑」 */
.c-mock-barrage__btn--stream.is-streaming {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  color: #2ee6a8;
  border-color: rgba(#2ee6a8, 0.55);
}

.c-mock-barrage__pulse {
  width: 6px;
  height: 6px;
  background: #2ee6a8;
  border-radius: 50%;
  animation: c-mock-barrage-pulse 1s ease-in-out infinite;
}

@keyframes c-mock-barrage-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.35;
    transform: scale(0.7);
  }
}

.c-mock-barrage__rate {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: #5d6478;
}

.c-mock-barrage__hint {
  margin-left: auto;
  font-size: 10px;
  color: #5d6478;

  /* 说明「为什么点不动」时得看得见，不能继续用那行灰色的沉默 */
  &.c-mock-barrage__hint--warn {
    color: #e0a458;
  }
}
</style>
