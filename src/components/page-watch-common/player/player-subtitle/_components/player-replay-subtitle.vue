<!-- @file 回放字幕（术语增强） -->
<template>
  <div
    v-if="mainText || translatedText"
    class="c-player-replay-subtitle"
    :style="{
      bottom: `${bottom}px`,
      fontSize: `${fontsize}`,
    }"
  >
    <p
      v-show="mainReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      <span
        v-for="(segment, index) in mainSegments"
        :key="`main-${index}`"
        :class="{
          'c-player-replay-subtitle__term': hasTerm(segment),
          'c-player-replay-subtitle__term--ambiguous': hasMultipleTerms(segment),
          'c-player-replay-subtitle__text': !hasTerm(segment),
        }"
        :role="hasTerm(segment) ? 'button' : undefined"
        :tabindex="hasTerm(segment) ? 0 : undefined"
        :title="termTitle(segment)"
        @click.stop="openTerm(segment.termIds)"
        @keydown.enter.stop.prevent="openTerm(segment.termIds)"
        >{{ segment.text }}</span
      >
    </p>
    <p
      v-show="subReplaySubtitleShow"
      class="c-player-replay-subtitle-line"
    >
      <span
        v-for="(segment, index) in translatedSegments"
        :key="`translated-${index}`"
        :class="{
          'c-player-replay-subtitle__term': hasTerm(segment),
          'c-player-replay-subtitle__term--ambiguous': hasMultipleTerms(segment),
          'c-player-replay-subtitle__text': !hasTerm(segment),
        }"
        :role="hasTerm(segment) ? 'button' : undefined"
        :tabindex="hasTerm(segment) ? 0 : undefined"
        :title="termTitle(segment)"
        @click.stop="openTerm(segment.termIds)"
        @keydown.enter.stop.prevent="openTerm(segment.termIds)"
        >{{ segment.text }}</span
      >
    </p>

    <transition name="term-card">
      <player-term-card
        v-if="activeTerm"
        :term="activeTerm"
        :candidates="activeTermCandidates"
        :active-index="activeTermIndex"
        :meta="activeTermMeta"
        :ask-label="askLabel"
        :ask-state="askState"
        @close="closeCard"
        @select="selectTerm"
        @ask="askQuestion"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useSubtitleProps, usePlayerSubtitle } from '../_hooks/_use-player-subtitle';
import { useReplaySubtitle } from '@/components/page-watch-common/subtitle/use-replay-subtitle';
import { useTermMatcher } from '../_hooks/use-term-matcher';
import { useTermCard } from '../_hooks/use-term-card';
import PlayerTermCard from './player-term-card.vue';
import { TermSegment } from '@/core/term/term-matcher';

const props = defineProps(useSubtitleProps());
const {
  fontsize,

  init,
  destroy,
} = usePlayerSubtitle({ props });

const { mainText, translatedText, mainReplaySubtitleShow, subReplaySubtitleShow } =
  useReplaySubtitle();

const { track, segmentsOf } = useTermMatcher();
const mainSegments = segmentsOf(mainText);
const translatedSegments = segmentsOf(translatedText);
const {
  activeTerm,
  activeTermCandidates,
  activeTermIndex,
  activeTermMeta,
  askLabel,
  askState,
  openTerm,
  selectTerm,
  closeCard,
  askQuestion,
} = useTermCard(track);

function hasTerm(segment: TermSegment) {
  return !!segment.termIds?.length;
}

function hasMultipleTerms(segment: TermSegment) {
  return (segment.termIds?.length ?? 0) > 1;
}

function termTitle(segment: TermSegment) {
  if (hasMultipleTerms(segment)) return '多个含义，点击选择';
  if (hasTerm(segment)) return '查看术语释义';
  return undefined;
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style lang="scss">
.c-player-replay-subtitle {
  position: absolute;
  bottom: 150px;
  left: 50%;
  z-index: 7;
  box-sizing: border-box;
  width: max-content;
  max-width: 90%;
  padding: 8px 20px;
  line-height: 1.5;
  color: #fff;
  text-align: left;
  background-color: rgba(29, 33, 41, 0.8);
  border-radius: 12px;
  transform: translateX(-50%);
}

.c-player-replay-subtitle-line {
  margin: 0;
  text-align: center;
}

.c-player-replay-subtitle__text {
  white-space: pre-wrap;
}

.c-player-replay-subtitle__term {
  padding: 0 2px;
  font-weight: 700;
  color: #7dd3fc;
  white-space: pre-wrap;
  pointer-events: auto;
  cursor: pointer;
  background: rgba(14, 165, 233, 0.22);
  border-bottom: 1px dashed #7dd3fc;
  border-radius: 3px;
  outline: none;
  transition: background-color 0.15s ease;
}

.c-player-replay-subtitle__term:hover,
.c-player-replay-subtitle__term:focus-visible {
  background: rgba(14, 165, 233, 0.4);
}

.c-player-replay-subtitle__term--ambiguous {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.22);
  border-bottom-color: #fcd34d;
  border-bottom-style: double;
}

.c-player-replay-subtitle__term--ambiguous:hover,
.c-player-replay-subtitle__term--ambiguous:focus-visible {
  background: rgba(245, 158, 11, 0.4);
}
</style>
