<!-- @file 移动端横屏-AI助手-用户提问消息 -->

<template>
  <mobile-ai-assistant-msg-container class="c-pc-ai-assistant-question-msg">
    <div class="c-pc-ai-assistant-question-msg__content">
      <p>{{ injectCtx.msg.content }}</p>
    </div>
  </mobile-ai-assistant-msg-container>
</template>

<script setup lang="ts">
import { useAIAssistantMsgInject } from '../_hooks/use-ai-assistant-msg-common';

import MobileAiAssistantMsgContainer from '../_msg-container/mobile-ai-assistant-msg-container.vue';

const injectCtx = useAIAssistantMsgInject();
</script>
