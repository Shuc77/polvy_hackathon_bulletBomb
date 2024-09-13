<!-- @file PC 端问卷弹窗 -->
<template>
  <pc-dialog
    class="c-pc-questionnaire-dialog"
    draggable
    :mask="false"
    :title="questionnaireTitle"
    :visible.sync="questionnaireVisible"
  >
    <iar-pc-questionnaire
      ref="questionnaireRef"
      :questionnaire-sdk="questionnaireSdk"
      :visible="questionnaireVisible"
      :is-hide-back-btn="!questionnaireBackBtnVisible"
      @status-changed="onStatusChanged"
      @to-show="setQuestionnaireVisible(true)"
      @to-hide="setQuestionnaireVisible(false)"
      @has-questionnaire="onHasQuestionnaire"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuestionnaire } from './hooks/use-questionnaire';

const IarPcQuestionnaire = getIarComponent('PcQuestionnarie');

const {
  questionnaireRef,
  questionnaireSdk,
  questionnaireVisible,
  questionnaireTitle,
  setQuestionnaireVisible,
  onStatusChanged,
  onHasQuestionnaire,
  questionnaireBackBtnVisible,
} = useQuestionnaire();
</script>
