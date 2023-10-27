<!-- @file 移动端横屏-AI助手回答消息 -->

<template>
  <mobile-ai-assistant-msg-container class="c-mobile-ai-assistant-answer-msg">
    <div
      v-if="injectCtx.msg.content"
      class="c-mobile-ai-assistant-answer-msg__content"
    >
      <p>{{ injectCtx.msg.content }}</p>
    </div>
    <div
      v-else
      class="c-mobile-ai-assistant-answer-msg__dot-container"
    >
      <span
        class="c-mobile-ai-assistant-answer-msg__dot pws-ai-assistant-msg-dot c-mobile-ai-assistant-answer-msg__dot1"
      ></span>
      <span
        class="c-mobile-ai-assistant-answer-msg__dot pws-ai-assistant-msg-dot c-mobile-ai-assistant-answer-msg__dot2"
      ></span>
      <span
        class="c-mobile-ai-assistant-answer-msg__dot pws-ai-assistant-msg-dot c-mobile-ai-assistant-answer-msg__dot3"
      ></span>
    </div>
  </mobile-ai-assistant-msg-container>
</template>

<script setup lang="ts">
import { useAIAssistantMsgInject } from '../_hooks/use-ai-assistant-msg-common';

import MobileAiAssistantMsgContainer from '../_msg-container/mobile-ai-assistant-msg-container.vue';

const injectCtx = useAIAssistantMsgInject();
</script>

<style lang="scss">
.c-mobile-ai-assistant-answer-msg__content {
  text-align: justify;
}

@keyframes dot-loading {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }

  100% {
    opacity: 1;
  }
}

.c-mobile-ai-assistant-answer-msg__dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.c-mobile-ai-assistant-answer-msg__dot1 {
  animation: dot-loading linear infinite 0.9s;
}

.c-mobile-ai-assistant-answer-msg__dot2 {
  margin: 0 7px;
  animation: dot-loading linear infinite 0.9s;
  animation-delay: 0.3s;
}

.c-mobile-ai-assistant-answer-msg__dot3 {
  animation: dot-loading linear infinite 0.9s;
  animation-delay: 0.6s;
}
</style>
