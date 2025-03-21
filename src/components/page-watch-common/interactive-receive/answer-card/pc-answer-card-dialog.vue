<!-- @file PC 端答题卡弹窗 -->
<template>
  <pc-dialog
    class="c-pc-answer-card-dialog"
    :title="answerCardTitle"
    :visible.sync="answerCardVisible"
    draggable
    :mask="false"
  >
    <iar-pc-answer-card
      ref="answerCardRef"
      :answer-card-sdk="answerCardSdk"
      :server-time-sync-enabled="serverTimeSyncEnabled"
      @to-show="setAnswerCardVisible(true)"
      @to-hide="setAnswerCardVisible(false)"
      @status-changed="onStatusChanged"
      @success-submit="onSubmitSuccess"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnswerCard } from './hooks/use-answer-card';

const IarPcAnswerCard = getIarComponent('PcAnswerCard');

const {
  answerCardRef,
  answerCardSdk,
  answerCardVisible,
  answerCardTitle,
  serverTimeSyncEnabled,
  setAnswerCardVisible,
  onStatusChanged,
  onSubmitSuccess,
} = useAnswerCard();
</script>

<style lang="scss">
.plv-iar-answer-card-result-default__btn__wrap--score {
  padding-bottom: 20px;
}
</style>
