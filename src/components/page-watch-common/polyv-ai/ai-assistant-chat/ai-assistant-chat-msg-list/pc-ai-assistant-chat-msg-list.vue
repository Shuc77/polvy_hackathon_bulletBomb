<!-- @file PC端-AI助手答疑面板-消息列表 -->

<template>
  <div
    ref="scrollRef"
    class="c-pc-ai-assistant-chat-msg-list pws-main-tab-body-scrollbar"
    @scroll="onScrollEvent"
  >
    <template v-for="(msg, index) in msgList">
      <pc-ai-assistant-chat-msg-item
        :key="`msg_${index}`"
        :msg="msg"
        :index="index"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import PcAiAssistantChatMsgItem from './msg-items/pc-ai-assistant-chat-msg-item.vue';

import {
  AIAssistantChatMsgListEmit,
  AIAssistantChatMsgProps,
  useAIAssistantChatMsgList,
} from './use-ai-assistant-chat-msg-list';

defineProps(AIAssistantChatMsgProps());

const emit = defineEmits(AIAssistantChatMsgListEmit());

const { scrollRef, AIAssistantChatMsgListInstance, onScrollEvent } = useAIAssistantChatMsgList({
  emit,
});

defineExpose(AIAssistantChatMsgListInstance);
</script>

<style lang="scss">
.c-pc-ai-assistant-chat-msg-list {
  height: 100%;
  overflow-y: auto;
  color: #adadc0;
  @include scrollbar;
}
</style>
