<!-- @file PC 端 AI 助手消息渲染节点 -->

<template>
  <div class="c-pc-ai-assistant-chat-msg-item">
    <!-- 用户提问消息 -->
    <pc-ai-assistant-question-msg v-if="msg.msgSource === PolyvAIAssistantChatMsgSource.Question" />
    <!-- AI 回答消息 -->
    <pc-ai-assistant-answer-msg
      v-else-if="msg.msgSource === PolyvAIAssistantChatMsgSource.Answer"
    />
    <div v-else></div>
  </div>
</template>

<script lang="ts" setup>
import { PolyvAIAssistantChatMsgSource } from '@polyv/live-watch-sdk';

import PcAiAssistantAnswerMsg from './ai-assistant-answer-msg/pc-ai-assistant-answer-msg.vue';
import PcAiAssistantQuestionMsg from './ai-assistant-question-msg/pc-ai-assistant-question-msg.vue';

import { useAIAssistantChatMsgItem } from './use-ai-assistant-chat-msg-item';
import { AIAssistantMsgItemCommonProps } from './_hooks/use-ai-assistant-msg-common';

const props = defineProps(AIAssistantMsgItemCommonProps());

useAIAssistantChatMsgItem({ props });
</script>

<style lang="scss">
.c-pc-ai-assistant-chat-msg-item {
  margin: 16px 0;
}
</style>
