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
          <span>互动窗口</span>
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
        <p class="c-feed-panel__note">锚点之后特效持续多久。</p>
      </div>

      <!-- 主动答题：锚点前抛出题目并提前收集。新锚点默认开启，旧锚点一键升级 -->
      <div class="c-feed-panel__collect">
        <div class="c-feed-panel__collect-head">
          <span class="c-feed-panel__title">答题卡</span>
          <span
            v-if="hasCollect"
            class="c-feed-panel__tag"
          >
            已开启
          </span>
          <button
            v-else
            type="button"
            class="c-feed-panel__enable"
            @click="enableCollect"
          >
            开启答题卡
          </button>
        </div>

        <template v-if="hasCollect">
          <div class="c-feed-panel__field">
            <div class="c-feed-panel__label">
              <span>答题卡文案</span>
            </div>
            <input
              :value="collectPrompt"
              class="c-feed-panel__input"
              type="text"
              :placeholder="autoPrompt"
              @input="onCollectPromptInput"
            />
          </div>

          <div class="c-feed-panel__field">
            <div class="c-feed-panel__label">
              <span>提前收集</span>
              <b>{{ leadSec }} 秒</b>
            </div>
            <plv-slider
              :value="leadSec"
              :min="MIN_WINDOW_SEC"
              :max="MAX_WINDOW_SEC"
              :progress-bar-visible="false"
              :hot-area-height="28"
              @input="onLeadSecInput"
            />
          </div>

          <p class="c-feed-panel__note">
            答题卡在锚点前 {{ leadSec }} 秒出现，到点时用这段时间收到的弹幕开演。
            主动答题只对回放时间锚点生效。
          </p>
        </template>

        <p
          v-else
          class="c-feed-panel__note"
        >
          旧配置保持静默收集。开启后锚点前会弹出答题卡，引导观众发弹幕参与。
        </p>
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
// 见 params-panel.vue 里的说明：polyv-ui 没有全局注册，模板里用到就得显式引入
import { PlvSlider } from '@/plugins/polyv-ui/admin-import';
import { collectLeadSecOf, resolveCollectPrompt } from '../collect';
import { FEED_MODE_LABELS, getEffectTemplate } from '../effects';
import {
  DEFAULT_WINDOW_SEC,
  MAX_WINDOW_SEC,
  MIN_WINDOW_SEC,
  resolveFeedMode,
} from '../feed-window';
import type { AnchorCollect, AnchorFeed, BarrageAnchor, EffectFeedMode } from '../types';

const props = defineProps<{
  anchor?: BarrageAnchor;
}>();

const emit = defineEmits<{
  (e: 'patch', patch: Partial<BarrageAnchor>): void;
}>();

const descriptor = computed(() =>
  props.anchor ? getEffectTemplate(props.anchor.template) : undefined,
);

/** 只有模板声明了不止一种驱动方式时才出现 —— 纯转场没有可选项 */
const modes = computed(() => descriptor.value?.feedModes ?? []);

/**
 * 当前生效的驱动方式
 * @desc ★ 必须与驱动器**同源**，所以走 `resolveFeedMode`。
 *   以前这里是 `feed?.mode ?? modes[0]`，少了「这个模板认不认这个 mode」那一步校验。
 *   碰上不认的值（换模板留下的旧 mode、手改过的地址栏配置），面板会高亮一个互动选项、
 *   把关键词和收集窗全渲染出来，而驱动器照旧跑 `static` ——
 *   作者对着一个「看起来是规模」的锚点调半天，画面里什么都没变
 */
const currentMode = computed<EffectFeedMode>(() => {
  const anchor = props.anchor;

  return anchor ? resolveFeedMode(anchor, descriptor.value) : 'static';
});

const windowSec = computed(() => props.anchor?.feed?.windowSec ?? DEFAULT_WINDOW_SEC);
const wordsA = computed(() => props.anchor?.feed?.wordsA ?? '');
const wordsB = computed(() => props.anchor?.feed?.wordsB ?? '');

/** 这个锚点开没开主动答题。旧锚点没有 `collect`，不预滚 */
const hasCollect = computed(() => !!props.anchor?.feed?.collect);

const collectPrompt = computed(() => props.anchor?.feed?.collect?.prompt ?? '');

/**
 * 实际生效的提前收集秒数
 * @desc 走 `collectLeadSecOf` 而不是直接读 `collect.leadSec`：没填时它沿用
 *   `windowSec`，并且会把驱动方式已经切成 `static` 的锚点判成 0
 */
const leadSec = computed(() => {
  const anchor = props.anchor;

  if (!anchor) {
    return DEFAULT_WINDOW_SEC;
  }

  return collectLeadSecOf(anchor, descriptor.value) || DEFAULT_WINDOW_SEC;
});

/**
 * 自动文案，用作输入框 placeholder
 * @desc 临时造一个 `collect: {}` 的副本，让 `resolveCollectPrompt` 走自动分支；
 *   作者填了文案就不会看到它
 */
const autoPrompt = computed(() => {
  const anchor = props.anchor;

  if (!anchor) {
    return '';
  }

  return (
    resolveCollectPrompt(
      { ...anchor, feed: { ...anchor.feed, mode: currentMode.value, collect: {} } },
      descriptor.value,
    )?.question ?? ''
  );
});

/** 保留已有的 feed 字段，只改要改的那个 —— 不然切模式会把关键词清空 */
function patchFeed(patch: Partial<AnchorFeed>): void {
  const next: AnchorFeed = { ...props.anchor?.feed, mode: currentMode.value, ...patch };

  emit('patch', { feed: next });
}

/** 只改 collect 内部的一个字段，保留另一个 */
function patchCollect(patch: Partial<AnchorCollect>): void {
  patchFeed({ collect: { ...props.anchor?.feed?.collect, ...patch } });
}

function selectMode(mode: EffectFeedMode): void {
  patchFeed({ mode });
}

function onWindowSecInput(value: number): void {
  patchFeed({ windowSec: value });
}

/** 旧配置的一次性升级：写入空对象即开启，题目与秒数走自动值 */
function enableCollect(): void {
  patchFeed({ collect: {} });
}

function onCollectPromptInput(event: Event): void {
  patchCollect({ prompt: (event.target as HTMLInputElement).value });
}

function onLeadSecInput(value: number): void {
  patchCollect({ leadSec: value });
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

/* 答题卡：虚线框把它和驱动方式的其他字段分开 —— 它是一套「只在回放时间锚点上生效」的附加配置 */
.c-feed-panel__collect {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(79, 124, 255, 0.06);
  border: 1px dashed #343d52;
  border-radius: 5px;
}

.c-feed-panel__collect-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.c-feed-panel__tag {
  font-size: 10px;
  color: #8fa8ff;
}

.c-feed-panel__enable {
  padding: 0;
  font-size: 10px;
  color: #9db4ff;
  cursor: pointer;
  background: none;
  border: 0;

  &:hover {
    color: #fff;
  }
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
