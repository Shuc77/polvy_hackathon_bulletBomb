<template>
  <div
    v-if="anchor && modes.length > 1"
    class="c-feed-panel"
  >
    <div class="c-feed-panel__head">
      <span class="c-feed-panel__title">弹幕驱动</span>
      <span class="c-feed-panel__hint">转场不读弹幕，其余方式由观众行为决定形态</span>
    </div>

    <div class="c-feed-panel__modes">
      <button
        v-for="mode in modes"
        :key="mode"
        type="button"
        class="c-feed-panel__mode"
        :class="{ 'is-active': mode === currentMode }"
        @click="selectMode(mode)"
      >
        {{ FEED_MODE_LABELS[mode] }}
      </button>
    </div>

    <template v-if="currentMode !== 'static'">
      <div class="c-feed-panel__field">
        <div class="c-feed-panel__label">
          <span>收集窗时长</span>
          <b>{{ windowSec }} 秒</b>
        </div>
        <plv-slider
          :value="windowSec"
          :min="MIN_WINDOW_SEC"
          :max="MAX_WINDOW_SEC"
          :progress-bar-visible="false"
          :hot-area-height="28"
          @input="onWindowSecInput"
        />
      </div>

      <template v-if="currentMode === 'polarity'">
        <div class="c-feed-panel__field">
          <div class="c-feed-panel__label">
            <span>A 派关键词</span>
          </div>
          <input
            :value="wordsA"
            class="c-feed-panel__input"
            type="text"
            placeholder="红, 1, 支持, A"
            @input="onWordsAInput"
          />
        </div>

        <div class="c-feed-panel__field">
          <div class="c-feed-panel__label">
            <span>B 派关键词</span>
          </div>
          <input
            :value="wordsB"
            class="c-feed-panel__input"
            type="text"
            placeholder="蓝, 2, 反对, B"
            @input="onWordsBInput"
          />
        </div>

        <p class="c-feed-panel__note">
          窗口内按包含关系分派，两边都命中的算弃权。占比同时驱动配色与缝的位置。
        </p>
      </template>

      <p
        v-else
        class="c-feed-panel__note"
      >
        {{
          currentMode === 'text'
            ? '窗口内弹幕的原文会成为画面里的字符，观众发什么就下什么。'
            : '窗口内的弹幕条数决定粒子规模，刷得越猛画面越满。'
        }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FEED_MODE_LABELS, getEffectTemplate } from '../effects';
import { DEFAULT_WINDOW_SEC, MAX_WINDOW_SEC, MIN_WINDOW_SEC } from '../feed-window';
import type { AnchorFeed, BarrageAnchor, EffectFeedMode } from '../types';

const props = defineProps<{
  anchor?: BarrageAnchor;
}>();

const emit = defineEmits<{
  (e: 'patch', patch: Partial<BarrageAnchor>): void;
}>();

/** 只有模板声明了不止一种驱动方式时才出现 —— 纯转场没有可选项 */
const modes = computed(
  () => getEffectTemplate(props.anchor?.template ?? 'shockwave')?.feedModes ?? [],
);

/** 缺省即模板的第一项，它永远是 static，所以旧锚点的语义一点不变 */
const currentMode = computed<EffectFeedMode>(
  () => props.anchor?.feed?.mode ?? modes.value[0] ?? 'static',
);

const windowSec = computed(() => props.anchor?.feed?.windowSec ?? DEFAULT_WINDOW_SEC);
const wordsA = computed(() => props.anchor?.feed?.wordsA ?? '');
const wordsB = computed(() => props.anchor?.feed?.wordsB ?? '');

/** 保留已有的 feed 字段，只改要改的那个 —— 不然切模式会把关键词清空 */
function patchFeed(patch: Partial<AnchorFeed>): void {
  const next: AnchorFeed = { ...props.anchor?.feed, mode: currentMode.value, ...patch };

  emit('patch', { feed: next });
}

function selectMode(mode: EffectFeedMode): void {
  patchFeed({ mode });
}

function onWindowSecInput(value: number): void {
  patchFeed({ windowSec: value });
}

function onWordsAInput(event: Event): void {
  patchFeed({ wordsA: (event.target as HTMLInputElement).value });
}

function onWordsBInput(event: Event): void {
  patchFeed({ wordsB: (event.target as HTMLInputElement).value });
}
</script>

<style lang="scss">
.c-feed-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: #171a21;
  border: 1px solid #262c37;
  border-radius: 6px;
}

.c-feed-panel__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.c-feed-panel__title {
  font-size: 12px;
  font-weight: 600;
  color: #e8eaf0;
}

.c-feed-panel__hint {
  font-size: 10px;
  color: #5d6478;
}

.c-feed-panel__modes {
  display: flex;
  gap: 4px;
}

.c-feed-panel__mode {
  flex: 1;
  padding: 5px 0;
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

.c-feed-panel__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.c-feed-panel__label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9aa1b4;

  b {
    font-variant-numeric: tabular-nums;
    color: #cdd6f0;
  }
}

.c-feed-panel__input {
  width: 100%;
  padding: 5px 8px;
  font-family: inherit;
  font-size: 11px;
  color: #d5dae8;
  background: #101319;
  border: 1px solid #3d4658;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #4f7cff;
  }

  &::placeholder {
    color: #4d5464;
  }
}

.c-feed-panel__note {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #5d6478;
}
</style>
