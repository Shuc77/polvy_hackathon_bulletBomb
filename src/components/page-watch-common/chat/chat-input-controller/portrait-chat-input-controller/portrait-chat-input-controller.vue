<!-- @file 竖屏端聊天室输入框 -->
<template>
  <div
    v-show="inputVisible"
    ref="inputWrapRef"
    class="c-portrait-chat-input-controller"
  >
    <!-- 消息引用 -->
    <portrait-chat-msg-quote />

    <portrait-msg-input-wrap
      ref="msgInputWrapRef"
      :placeholder="chatInputPlaceholder"
      :disabled-input="chatInputDisabled"
      :disabled-emotion-picker="chatInputDisabled"
      :face-emotion-enabled="chatSetting.faceEmotionEnabled"
      :image-emotion-enabled="chatSetting.imageEmotionEnabled"
      @system-msg="onSendSystemMsg"
      @submit="onSubmit"
      @click-image-emotion="closeInput"
    />
  </div>
</template>

<script setup lang="ts">
import PortraitChatMsgQuote from '@/components/page-watch-common/chat/chat-msg-quote/mobile-chat-msg-quote.vue';
import PortraitMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/portrait-msg-input-wrap/portrait-msg-input-wrap.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { nextTick, ref } from 'vue';
import { useChatInputController } from '../hooks/use-chat-input-controller';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { PlvInputContent } from '@/plugins/polyv-ui/types';

const inputWrapRef = ref<HTMLDivElement>();

const { onSubmitMessage, onSendSystemMsg, msgInputWrapRef, focusMsgInput } =
  useChatInputController();

useAppendTo(inputWrapRef);

const {
  visible: inputVisible,
  close: closeInput,
  setVisible: setInputVisible,
} = useSimpleVisible();

useEventBusListener(appEvents.chat.FocusToChatInput, async () => {
  setInputVisible(true);
  await nextTick();

  focusMsgInput();
});

useClickOutside(inputWrapRef, () => {
  setInputVisible(false);
});

const { chatInputPlaceholder, chatInputDisabled, chatSetting } =
  storeDefinitionToRefs(useChatStore);

function onSubmit(params: { contentList: PlvInputContent[] }) {
  onSubmitMessage(params);
  setInputVisible(false);
}
</script>

<style lang="scss">
.c-portrait-chat-input-controller {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: $--zIndex-top -2;
  width: 100%;
}
</style>
