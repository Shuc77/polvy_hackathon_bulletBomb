<!-- @file 移动端快速问答 -->
<template>
  <custom-teleport :to="renderParent">
    <iar-mobile-quick-answer-card
      class="c-mobile-quick-answer-card"
      :class="{
        'c-mobile-quick-answer-card--page-fullscreen': isIarFullScreen,
      }"
      v-show="quickAnswerCardVisible"
      :answer-card-sdk="answerCardSdk"
      @to-show="onToShow"
      @to-hide="setQuickAnswerCardVisible(false)"
      @success-submit="onSubmitSuccess"
    />
  </custom-teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';

import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuickAnswerCard } from './hooks/use-quick-answer-card';
import { QuestionData } from './types/answer-card-types';

const IarMobileQuickAnswerCard = getIarComponent('MobileQuickAnswer');

const { isPageFullscreenOrHorizontalScreen } = storeDefinitionToRefs(useLayoutStore);
const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const renderParent = computed<string | HTMLElement>(() => {
  return isPageFullscreenOrHorizontalScreen.value ? document.body : '';
});

const { answerCardSdk, quickAnswerCardVisible, setQuickAnswerCardVisible, onSubmitSuccess } =
  useQuickAnswerCard();

function onToShow(question: QuestionData) {
  setQuickAnswerCardVisible(true, question);
}
</script>

<style lang="scss">
.c-mobile-quick-answer-card--page-fullscreen {
  position: fixed;
  top: 0;
  top: 50%;
  left: 50%;
  z-index: 2000 !important;
  transform: rotate(90deg);
  transform-origin: top;
}

@media screen and (orientation: landscape) {
  .plv-iar-quick-answer-default {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2000 !important;
    width: 100vh;
    margin: auto;
  }
}
</style>
