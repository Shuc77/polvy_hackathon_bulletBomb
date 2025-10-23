<!-- @file 竖屏问答弹层 -->
<template>
  <mobile-popup
    class="c-portrait-question-answer-popup"
    :visible.sync="visible"
    fill-body-section
    hide-header-border
    :title="qaMenuData.label"
    :theme="PopupTheme.PortraitLight"
  >
    <mobile-question-answer
      theme="white"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :question-answer-sdk="questionAnswerSdk"
      @preview="onPreviewImage"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import MobileQuestionAnswer from './mobile-question-answer.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useQuestionAnswer } from './hooks/use-question-answer';
import { useChatStore } from '@/store/use-chat-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { visible, setVisible } = useSimpleVisible();

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { questionAnswerSdk, onPreviewImage } = useQuestionAnswer();

const { needInterruptUserClick } = useInterruptUserClick();

useEventBusListener(appEvents.interaction.OpenQuestionAnswer, (_visible = true) => {
  if (_visible && needInterruptUserClick.value) {
    return;
  }
  setVisible(_visible);
});
</script>

<style lang="scss">
.c-portrait-question-answer-popup {
  .plv-ia-qa--mob {
    .plv-ia-qa-ask__entry {
      background-color: transparent;
      background-image: url(./imgs/icon-btn-edit.png) !important;
      background-size: contain;
    }
  }
}
</style>
