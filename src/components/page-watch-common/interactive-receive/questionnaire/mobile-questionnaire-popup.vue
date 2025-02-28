<!-- @file 移动端+竖屏端问卷弹窗 -->
<template>
  <mobile-popup
    class="c-mobile-questionnaire-popup"
    fill-body-section
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :backable="popupBackable"
    :title="questionnaireTitle"
    :visible.sync="questionnaireVisible"
    @click-back="backToQuestionnaireList"
  >
    <iar-mobile-questionnaire
      ref="questionnaireRef"
      :questionnaire-sdk="questionnaireSdk"
      :visible="questionnaireVisible"
      :is-hide-back-btn="!questionnaireBackBtnVisible"
      @status-changed="onStatusChanged"
      @to-show="setQuestionnaireVisible(true)"
      @to-hide="setQuestionnaireVisible(false)"
      @has-questionnaire="onHasQuestionnaire"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuestionnaire } from './hooks/use-questionnaire';
import { AllQuestionnaireStatus } from './types/questionnaire-type';

const IarMobileQuestionnaire = getIarComponent('MobileQuestionnarie');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const {
  questionnaireRef,
  questionnaireSdk,
  questionnaireVisible,
  questionnaireTitle,
  questionnaireStatus,
  setQuestionnaireVisible,
  onStatusChanged,
  onHasQuestionnaire,
  questionnaireBackBtnVisible,
} = useQuestionnaire();

const popupBackable = computed(() => {
  return (
    questionnaireStatus.value === AllQuestionnaireStatus.IsShowQuestion &&
    questionnaireBackBtnVisible.value
  );
});

function backToQuestionnaireList() {
  questionnaireRef.value && questionnaireRef.value.showList();
}
</script>
