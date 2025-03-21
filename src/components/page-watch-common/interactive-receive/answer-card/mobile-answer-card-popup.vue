<!-- @file 移动端+竖屏端答题卡弹层 -->
<template>
  <mobile-popup
    class="c-mobile-answer-card-popup"
    fill-body-section
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :title="answerCardTitle"
    :visible.sync="answerCardVisible"
    :backable="answerCardStatus === AllAnswerCardStatus.IsShowAnswer"
    @click-back="onClickBack"
  >
    <iar-mobile-answer-card
      ref="answerCardRef"
      :answer-card-sdk="answerCardSdk"
      :server-time-sync-enabled="serverTimeSyncEnabled"
      @to-show="setAnswerCardVisible(true)"
      @to-hide="setAnswerCardVisible(false)"
      @status-changed="onStatusChanged"
      @success-submit="onSubmitSuccess"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnswerCard } from './hooks/use-answer-card';

const IarMobileAnswerCard = getIarComponent('MobileAnswerCard');

const {
  AllAnswerCardStatus,
  answerCardRef,
  answerCardSdk,
  answerCardVisible,
  answerCardTitle,
  answerCardStatus,
  serverTimeSyncEnabled,
  setAnswerCardVisible,
  onStatusChanged,
  onSubmitSuccess,
} = useAnswerCard();

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

/** 处理点击返回 */
const onClickBack = () => {
  if (answerCardRef.value && answerCardRef.value.backToResult) {
    answerCardRef.value.backToResult();
  }
};
</script>
