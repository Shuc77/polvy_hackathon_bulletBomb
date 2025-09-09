<template>
  <div class="c-pc-iar-render-v2">
    <!-- 问卷 -->
    <questionnaire-dialog v-if="useV2Questionnaire" />

    <!-- 答题卡 -->
    <answer-card-dialog />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';
import AnswerCardDialog from './answer-card-v2/answer-card-dialog/answer-card-dialog.vue';

const { useV2Questionnaire } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
