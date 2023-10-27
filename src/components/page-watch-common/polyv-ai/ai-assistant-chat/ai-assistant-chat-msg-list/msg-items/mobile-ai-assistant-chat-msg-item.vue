<!-- @file 移动端横屏 AI 助手消息渲染节点 -->

<template>
  <div class="c-mobile-ai-assistant-chat-msg-item">
    <!-- 用户提问消息 -->
    <mobile-ai-assistant-question-msg
      v-if="msg.msgSource === PolyvAIAssistantChatMsgSource.Question"
    />
    <!-- AI 回答消息 -->
    <mobile-ai-assistant-answer-msg
      v-else-if="msg.msgSource === PolyvAIAssistantChatMsgSource.Answer"
    />
    <div v-else></div>
  </div>
</template>

<script lang="ts" setup>
import { PolyvAIAssistantChatMsgSource } from '@polyv/live-watch-sdk';

import MobileAiAssistantAnswerMsg from './ai-assistant-answer-msg/mobile-ai-assistant-answer-msg.vue';
import MobileAiAssistantQuestionMsg from './ai-assistant-question-msg/mobile-ai-assistant-question-msg.vue';

import { useAIAssistantChatMsgItem } from './use-ai-assistant-chat-msg-item';
import { AIAssistantMsgItemCommonProps } from './_hooks/use-ai-assistant-msg-common';

const props = defineProps(AIAssistantMsgItemCommonProps());

useAIAssistantChatMsgItem({ props });
</script>

<style lang="scss">
.c-mobile-ai-assistant-chat-msg-item {
  margin: 16px 0;
}
</style>
