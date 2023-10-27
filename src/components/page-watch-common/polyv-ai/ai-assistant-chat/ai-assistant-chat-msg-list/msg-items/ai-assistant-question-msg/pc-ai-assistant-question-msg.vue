<!-- @file PC 端-AI助手用户提问消息 -->

<template>
  <pc-ai-assistant-msg-container class="c-pc-ai-assistant-question-msg">
    <div class="c-pc-ai-assistant-question-msg__content">
      <p>{{ injectCtx.msg.content }}</p>
    </div>
  </pc-ai-assistant-msg-container>
</template>

<script setup lang="ts">
import { useAIAssistantMsgInject } from '../_hooks/use-ai-assistant-msg-common';

import PcAiAssistantMsgContainer from '../_msg-container/pc-ai-assistant-msg-container.vue';

const injectCtx = useAIAssistantMsgInject();
</script>
