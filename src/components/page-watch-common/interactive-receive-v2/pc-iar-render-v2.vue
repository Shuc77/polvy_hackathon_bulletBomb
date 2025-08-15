<template>
  <div class="c-pc-iar-render-v2">
    <questionnaire-dialog v-if="useV2Questionnaire" />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';

const { useV2Questionnaire } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
