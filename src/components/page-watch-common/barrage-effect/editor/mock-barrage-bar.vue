<template>
  <div class="c-mock-barrage">
    <span class="c-mock-barrage__title">模拟弹幕</span>

    <button
      type="button"
      class="c-mock-barrage__btn"
      @click="sendOne('primary')"
    >
      +1 {{ primaryWord }}
    </button>
    <button
      type="button"
      class="c-mock-barrage__btn"
      @click="sendOne('secondary')"
    >
      +1 {{ secondaryWord }}
    </button>

    <div class="c-mock-barrage__ratio">
      <span class="c-mock-barrage__ratio-label">A 派占比</span>
      <plv-slider
        :value="ratioPercent"
        :min="0"
        :max="100"
        :progress-bar-visible="false"
        :hot-area-height="24"
        @input="onRatioInput"
      />
      <b class="c-mock-barrage__ratio-value">{{ ratioPercent }}%</b>
    </div>

    <button
      type="button"
      class="c-mock-barrage__btn"
      @click="onBurst"
    >
      连发 8 条
    </button>

    <span class="c-mock-barrage__hint">与真实弹幕同一个入口</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FALLBACK_WORDS, useMockBarrage } from './mock-barrage';
import { parseKeywords } from '../feed-window';

/** 一次连发多少条 */
const BURST_COUNT = 8;

const props = defineProps<{
  wordsA?: string;
  wordsB?: string;
}>();

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
</script>

<style lang="scss">
.c-mock-barrage {
  display: flex;
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

  &:hover {
    border-color: #4f7cff;
  }
}

.c-mock-barrage__ratio {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 200px;
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

.c-mock-barrage__hint {
  margin-left: auto;
  font-size: 10px;
  color: #5d6478;
}
</style>
