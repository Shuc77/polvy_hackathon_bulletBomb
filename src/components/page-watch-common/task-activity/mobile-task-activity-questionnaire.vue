<template>
  <mobile-popup
    class="c-mobile-normal-questionnaire-popup"
    fill-body-section
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :show-header="false"
    :visible.sync="questionnaireVisible"
  >
    <iar-normal-questionnaire
      v-if="targetInited"
      :questionnaire-target="getIarTarget()"
      :questionnaire-data="currentQuestionnaire"
      @submit="onSubmitData"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { defineAsyncComponent } from 'vue';
import { useTaskActivityQuestionnaire } from './hooks/use-task-activity-questionnaire';
import { useIarUILoader } from '../interactive-receive-v2/_load-iar-ui-v2';
import { useQuestionnaireTarget } from '../interactive-receive-v2/questionnaire-v2/hooks/use-questionnaire-v2';

const { targetInited, getIarTarget } = useQuestionnaireTarget();

const { questionnaireVisible, currentQuestionnaire, onSubmitData } = useTaskActivityQuestionnaire();

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const { loadIarUI } = useIarUILoader('iar-questionnaire-ui');

const IarNormalQuestionnaire = defineAsyncComponent(() => loadIarUI('normal-questionnaire'));
</script>
