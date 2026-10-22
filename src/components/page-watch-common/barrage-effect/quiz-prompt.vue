<!-- @file 答题卡（生产播放器与工作台舞台共用） -->
<template>
  <div class="c-quiz-prompt">
    <div
      class="c-quiz-prompt__card"
      :style="accentStyle"
    >
      <div class="c-quiz-prompt__head">
        <span class="c-quiz-prompt__badge">答题</span>
        <span class="c-quiz-prompt__count">{{ seconds }}s</span>
      </div>

      <p class="c-quiz-prompt__question">{{ question }}</p>

      <div
        v-if="hintA || hintB"
        class="c-quiz-prompt__options"
      >
        <span
          v-if="hintA"
          class="c-quiz-prompt__option"
        >
          <b>A</b>
          {{ hintA }}
        </span>
        <span
          v-if="hintB"
          class="c-quiz-prompt__option"
        >
          <b>B</b>
          {{ hintB }}
        </span>
      </div>

      <div class="c-quiz-prompt__progress">
        <i :style="{ width: progress + '%' }" />
      </div>

      <button
        v-if="skippable"
        type="button"
        class="c-quiz-prompt__skip"
        @click.stop="emit('skip')"
      >
        跳过答题卡
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  question: string;
  /** 对冲用的 A/B 关键词；没有配置就不显示胶囊 */
  hintA?: string;
  hintB?: string;
  /** 距锚点还有多少秒 */
  remaining: number;
  /** 预滚总时长，用来画进度条 */
  total: number;
  /** 模板强调色 */
  accent?: string;
  /** 只在工作台预览里显示「跳过」 */
  skippable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'skip'): void;
}>();

const seconds = computed(() => Math.max(0, Math.ceil(props.remaining)));

const progress = computed(() => {
  if (!(props.total > 0)) {
    return 0;
  }

  return Math.min(Math.max(props.remaining / props.total, 0), 1) * 100;
});

/** CSS 变量只能通过内联样式写，不能直接绑在模板里 */
const accentStyle = computed(
  () => ({ '--quiz-accent': props.accent ?? '#4f7cff' } as Record<string, string>),
);
</script>

<style lang="scss">
.c-quiz-prompt {
  position: absolute;
  top: 14px;
  left: 50%;
  z-index: 2;
  width: max-content;
  max-width: calc(100% - 32px);
  pointer-events: none;
  transform: translateX(-50%);
}

/**
 * 多张答题卡竖排
 * @desc 两条锚点的收集区重叠时，两个答题卡都在倒数 —— 只显示队首会让
 *   第二个特效看起来「没有收集、也没有题目」。堆叠后每张卡保留自己的
 *   倒计时和进度条，到点的锚点只移除自己那一张
 */
.c-quiz-prompt-stack {
  position: absolute;
  top: 14px;
  left: 50%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: max-content;
  max-width: calc(100% - 32px);
  pointer-events: none;
  transform: translateX(-50%);

  .c-quiz-prompt {
    position: static;
    max-width: 100%;
    transform: none;
  }
}

.c-quiz-prompt__card {
  position: relative;
  min-width: 240px;
  max-width: 420px;
  padding: 10px 14px 12px;
  background: rgba(12, 14, 20, 0.84);
  border: 1px solid var(--quiz-accent);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  animation: quiz-prompt-in 0.22s ease-out;
}

@keyframes quiz-prompt-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.c-quiz-prompt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.c-quiz-prompt__badge {
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.04em;
  background: var(--quiz-accent);
  border-radius: 4px;
}

.c-quiz-prompt__count {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: #fff;
}

.c-quiz-prompt__question {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: #f4f6fb;
  overflow-wrap: anywhere;
}

.c-quiz-prompt__options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.c-quiz-prompt__option {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 3px 9px;
  font-size: 11px;
  color: #dfe4f0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;

  b {
    color: var(--quiz-accent);
  }
}

.c-quiz-prompt__progress {
  height: 3px;
  margin-top: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 3px;

  i {
    display: block;
    height: 100%;
    background: var(--quiz-accent);
    border-radius: inherit;
    transition: width 0.12s linear;
  }
}

.c-quiz-prompt__skip {
  display: block;
  padding: 0;
  margin: 8px 0 0 auto;
  font-size: 10px;
  color: #9aa1b4;
  pointer-events: auto;
  cursor: pointer;
  background: none;
  border: 0;

  &:hover {
    color: #fff;
  }
}
</style>
