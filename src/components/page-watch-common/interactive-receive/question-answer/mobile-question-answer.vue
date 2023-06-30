<!-- @file 移动端互动问答 -->
<template>
  <div class="c-mobile-question-answer">
    <iar-mobile-question-answer
      class="c-mobile-question-answer__main"
      :question-answer-sdk="questionAnswerSdk"
      :theme="theme"
      :has-nick="hasNickname"
      @set-nick="onSetNick"
      @preview="onPreviewImage"
      @news="onNewsEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { unref } from 'vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useQuestionAnswer } from './hooks/use-question-answer';

const IarMobileQuestionAnswer = getIarComponent('MobileQuestionAnswer');

defineProps({
  /** 问答主题，黑or白 */
  theme: PropUtils.oneOf(['black', 'white'] as const).def('black'),
});

const { questionAnswerSdk, onSetNick, onPreviewImage } = useQuestionAnswer();

const { hasNickname } = storeDefinitionToRefs(useViewerStore);

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

const interactReceiveStore = useInteractReceiveStore();

function onNewsEvent() {
  if (unref(mobileMenuCurrentName) === TAB_NAME_QA) return;

  interactReceiveStore.$patch({
    qaReminderVisible: true,
  });
}
</script>

<style lang="scss">
.c-mobile-question-answer {
  position: relative;
  height: 100%;
}
.c-mobile-question-answer__main {
  height: 100%;
}
</style>
