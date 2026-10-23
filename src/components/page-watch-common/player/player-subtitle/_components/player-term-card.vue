<!-- @file 术语释义卡片 -->
<template>
  <aside
    class="c-player-term-card"
    @click.stop
  >
    <button
      class="c-player-term-card__close"
      type="button"
      aria-label="关闭术语卡片"
      @click="emit('close')"
    >
      ×
    </button>
    <div class="c-player-term-card__head">
      <strong class="c-player-term-card__name">{{ term.canonical }}</strong>
      <span class="c-player-term-card__track">{{ meta }}</span>
    </div>
    <div
      v-if="candidates.length > 1"
      class="c-player-term-card__candidates"
    >
      <span class="c-player-term-card__candidates-label">可能含义</span>
      <div class="c-player-term-card__candidates-list">
        <button
          v-for="(candidate, index) in candidates"
          :key="candidate.id"
          class="c-player-term-card__candidate"
          :class="{ 'is-active': index === activeIndex }"
          type="button"
          @click="emit('select', index)"
        >
          {{ candidate.canonical }}
        </button>
      </div>
    </div>
    <p class="c-player-term-card__meaning">
      <span class="c-player-term-card__label">中文</span>{{ term.zh }}
    </p>
    <p class="c-player-term-card__meaning">
      <span class="c-player-term-card__label">EN</span>{{ term.en }}
    </p>
    <p
      v-if="term.note"
      class="c-player-term-card__note"
    >
      {{ term.note }}
    </p>
    <button
      class="c-player-term-card__ask"
      type="button"
      :disabled="askState === 'sending' || askState === 'sent'"
      @click="emit('ask')"
    >
      {{ askLabel }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { AskState } from '../_hooks/use-term-card';
import type { TermItem } from '@/core/term/term-matcher';

defineProps({
  term: {
    type: Object as PropType<TermItem>,
    required: true,
  },
  candidates: {
    type: Array as PropType<TermItem[]>,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
  meta: {
    type: String,
    default: '',
  },
  askLabel: {
    type: String,
    default: '一键提问',
  },
  askState: {
    type: String as PropType<AskState>,
    default: 'idle',
  },
});

const emit = defineEmits(['close', 'select', 'ask']);
</script>

<style lang="scss">
.c-player-term-card {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  z-index: 2;
  box-sizing: border-box;
  width: 340px;
  max-width: calc(100vw - 24px);
  padding: 15px 16px 16px;
  color: #0f172a;
  text-align: left;
  text-shadow: none;
  pointer-events: auto;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.28);
}

.c-player-term-card__close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 18px;
  line-height: 22px;
  color: #64748b;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 50%;
}

.c-player-term-card__close:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.c-player-term-card__head {
  display: flex;
  align-items: center;
  padding-right: 24px;
}

.c-player-term-card__name {
  font-size: 18px;
  line-height: 1.4;
  color: #0f172a;
}

.c-player-term-card__track {
  padding: 1px 7px;
  margin-left: 8px;
  font-size: 12px;
  color: #0369a1;
  background: #e0f2fe;
  border-radius: 10px;
}

.c-player-term-card__candidates {
  margin-top: 10px;
}

.c-player-term-card__candidates-label {
  display: block;
  margin-bottom: 5px;
  font-size: 11px;
  color: #64748b;
}

.c-player-term-card__candidates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.c-player-term-card__candidate {
  padding: 4px 8px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 6px;
}

.c-player-term-card__candidate:hover {
  color: #0369a1;
  background: #e0f2fe;
}

.c-player-term-card__candidate.is-active {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.c-player-term-card__meaning {
  margin: 9px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
}

.c-player-term-card__label {
  display: inline-block;
  min-width: 30px;
  padding: 0 5px;
  margin-right: 5px;
  font-size: 11px;
  line-height: 18px;
  color: #475569;
  text-align: center;
  background: #f1f5f9;
  border-radius: 4px;
}

.c-player-term-card__note {
  padding: 8px 9px;
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #92400e;
  background: #fffbeb;
  border-radius: 6px;
}

.c-player-term-card__ask {
  width: 100%;
  padding: 8px 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  background: #2563eb;
  border: 0;
  border-radius: 7px;
}

.c-player-term-card__ask:hover:not(:disabled) {
  background: #1d4ed8;
}

.c-player-term-card__ask:disabled {
  cursor: default;
  opacity: 0.7;
}

.term-card-enter,
.term-card-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.term-card-enter-active,
.term-card-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

@media (max-width: 768px) {
  .c-player-term-card {
    width: 280px;
    padding: 13px 14px 14px;
  }

  .c-player-term-card__meaning {
    font-size: 12px;
  }
}
</style>
