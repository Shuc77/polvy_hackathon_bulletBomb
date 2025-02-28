<template>
  <div
    v-if="currentActivityData"
    class="c-mobile-task-activity-pendant"
    :class="{
      'c-mobile-task-activity-pendant--en': currentLang !== LangType.ZH_CN,
    }"
    @click="onClickPendant"
  >
    <!-- 任务活动弹层 -->
    <mobile-task-activity-dialog />

    <!-- 任务活动答题弹层 -->
    <mobile-task-activity-questionnaire />
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useTaskActivityStore } from '@/store/use-task-activity-store';
import MobileTaskActivityDialog from './mobile-task-activity-dialog.vue';
import MobileTaskActivityQuestionnaire from './mobile-task-activity-questionnaire.vue';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

const { currentActivityData } = storeDefinitionToRefs(useTaskActivityStore);

const { currentLang } = storeDefinitionToRefs(useLangStore);

function onClickPendant() {
  getEmitter().emit(appEvents.global.OpenTaskActivityDialog);
}
</script>

<style lang="scss">
.c-mobile-task-activity-pendant {
  width: 40px;
  height: 40px;
  background-image: url(./images/pendant-icon.png);
  background-size: contain;
}
.c-mobile-task-activity-pendant--en {
  background-image: url(./images/pendant-icon-en.png);
}
</style>
