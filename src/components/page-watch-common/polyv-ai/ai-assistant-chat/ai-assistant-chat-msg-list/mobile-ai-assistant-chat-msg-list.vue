<!-- @file 移动端横屏-AI助手答疑面板-消息列表 -->

<template>
  <div
    ref="scrollRef"
    class="c-mobile-ai-assistant-chat-msg-list"
    @scroll="onScrollEvent"
  >
    <template v-for="(msg, index) in msgList">
      <mobile-ai-assistant-chat-msg-item
        :key="`msg_${index}`"
        :msg="msg"
        :index="index"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import MobileAiAssistantChatMsgItem from './msg-items/mobile-ai-assistant-chat-msg-item.vue';

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
.c-mobile-ai-assistant-chat-msg-list {
  height: 100%;
  overflow-y: auto;
}
</style>
