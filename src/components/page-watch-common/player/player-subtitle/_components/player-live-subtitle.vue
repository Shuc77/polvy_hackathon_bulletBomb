<!-- @file 直播实时字幕（术语增强） -->
<template>
  <div
    v-show="localUerSubtitlesEnable"
    class="c-player-live-subtitle"
    :style="{
      bottom: `${bottom}px`,
      height: `${subtitleHeight}px`,
      fontSize: `${fontsize}`,
    }"
  >
    <div
      v-show="showSubtitle"
      class="c-player-live-subtitle__inner"
    >
      <p class="c-player-live-subtitle__line">
        <span
          v-for="(segment, index) in sourceSegments"
          :key="`source-${index}`"
          :class="{
            'c-player-live-subtitle__term': hasTerm(segment),
            'c-player-live-subtitle__term--ambiguous': hasMultipleTerms(segment),
            'c-player-live-subtitle__text': !hasTerm(segment),
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
        v-if="translationSegments.length"
        class="c-player-live-subtitle__line c-player-live-subtitle__line--translation"
      >
        <span
          v-for="(segment, index) in translationSegments"
          :key="`translation-${index}`"
          :class="{
            'c-player-live-subtitle__term': hasTerm(segment),
            'c-player-live-subtitle__term--ambiguous': hasMultipleTerms(segment),
            'c-player-live-subtitle__text': !hasTerm(segment),
          }"
          :role="hasTerm(segment) ? 'button' : undefined"
          :tabindex="hasTerm(segment) ? 0 : undefined"
          :title="termTitle(segment)"
          @click.stop="openTerm(segment.termIds)"
          @keydown.enter.stop.prevent="openTerm(segment.termIds)"
          >{{ segment.text }}</span
        >
      </p>
    </div>

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
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { TermSegment } from '@/core/term/term-matcher';
import { usePlayerSubtitle, useSubtitleProps } from '../_hooks/_use-player-subtitle';
import { useTermSubtitle } from '../_hooks/use-term-subtitle';
import PlayerTermCard from './player-term-card.vue';

const { liveSubtitlesEnable, localUerSubtitlesEnable } = storeDefinitionToRefs(useSubtitleStore);

const props = defineProps(useSubtitleProps());
const { fontsize, subtitleHeight, init, destroy } = usePlayerSubtitle({ props });

const {
  showSubtitle,
  sourceSegments,
  translationSegments,
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
  resetSubtitle,
} = useTermSubtitle();

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

watch(
  () => liveSubtitlesEnable.value,
  enabled => {
    if (!enabled) {
      resetSubtitle();
    }
  },
);

watch(showSubtitle, visible => {
  console.info('[term-subtitle] showSubtitle', visible, {
    source: sourceSegments.value
      .map(segment => segment.text)
      .join('')
      .slice(0, 60),
    translation: translationSegments.value
      .map(segment => segment.text)
      .join('')
      .slice(0, 60),
  });
});

onMounted(() => {
  console.info('[term-subtitle] component mounted');
  init();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style lang="scss">
.c-player-live-subtitle {
  position: absolute;
  bottom: 150px;
  left: 10%;
  z-index: 8;
  width: 80%;
  overflow: visible;
  line-height: 1.5;
  color: #fff;
  text-align: left;
  // prettier-ignore
  text-shadow: rgb(0, 0, 0) 1px 0 1px,
    rgb(0, 0, 0) 0 1px 1px,
    rgb(0, 0, 0) 0 -1px 1px,
    rgb(0, 0, 0) -1px 0 1px;
  pointer-events: none;
}

.c-player-live-subtitle__inner {
  position: absolute;
  bottom: 0;
  left: 0;
  max-width: 100%;
  padding: 5px 8px;
  color: #fff;
  overflow-wrap: anywhere;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
}

.c-player-live-subtitle__line {
  margin: 0;
}

.c-player-live-subtitle__line--translation {
  margin-top: 2px;
  font-size: 0.88em;
  opacity: 0.9;
}

.c-player-live-subtitle__text {
  white-space: pre-wrap;
}

.c-player-live-subtitle__term {
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

.c-player-live-subtitle__term:hover,
.c-player-live-subtitle__term:focus-visible {
  background: rgba(14, 165, 233, 0.4);
}

.c-player-live-subtitle__term--ambiguous {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.22);
  border-bottom-color: #fcd34d;
  border-bottom-style: double;
}

.c-player-live-subtitle__term--ambiguous:hover,
.c-player-live-subtitle__term--ambiguous:focus-visible {
  background: rgba(245, 158, 11, 0.4);
}
</style>
