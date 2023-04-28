<!-- @file PC 端快速答题卡弹窗 -->
<template>
  <pc-dialog
    class="c-pc-quick-answer-card-dialog"
    draggable
    :width="202"
    :mask="false"
    :title="quickAnswerCardTitle"
    :visible.sync="quickAnswerCardVisible"
    :position-computed-elem="PC_MAIN_PLAYER_SELECTOR"
  >
    <iar-pc-quick-answer-card
      :answer-card-sdk="answerCardSdk"
      @to-show="onToShow"
      @to-hide="setQuickAnswerCardVisible(false)"
      @success-submit="onSubmitSuccess"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { PC_MAIN_PLAYER_SELECTOR } from '@/assets/constants/selector';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuickAnswerCard } from './hooks/use-quick-answer-card';
import { QuestionData } from './types/answer-card-types';

const IarPcQuickAnswerCard = getIarComponent('PcQuickAnswer');

const {
  answerCardSdk,
  quickAnswerCardVisible,
  quickAnswerCardTitle,
  setQuickAnswerCardVisible,
  onSubmitSuccess,
} = useQuickAnswerCard();

function onToShow(question: QuestionData) {
  setQuickAnswerCardVisible(true, question);
}
</script>
