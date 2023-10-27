<!-- @file 移动端横屏-AI助手答疑面板 -->

<template>
  <div
    v-if="AIAssistantChatVisible"
    class="c-mobile-ai-assistant-chat"
  >
    <!-- 消息列表 -->
    <div class="c-mobile-ai-assistant-chat__msg-list">
      <mobile-ai-assistant-chat-msg-list
        ref="msgListRef"
        :msg-list="AIAssistantChatMsgRenderList"
      />
    </div>

    <!-- 输入框 -->
    <div
      class="c-mobile-ai-assistant-chat__input"
      v-if="!AIAssistantChatInputDisabled"
    >
      <mobile-msg-input-wrap
        ref="msgInputWrapRef"
        :face-emotion-enabled="false"
        :image-emotion-enabled="false"
        :send-image-enabled="false"
        :image-paste-input-enabled="false"
        :placeholder="AIAssistantInputPlaceholder"
        :disabled-input="false"
        :disabled-emotion-picker="true"
        :disabled-send-image="true"
        :disabled-submit-btn="AIAssistantChatStatus === PolyvAIAssistantChatStatus.Replaying"
        @submit="onSubmitMessage"
      />
    </div>
  </div>
  <div
    v-else
    class="c-mobile-ai-assistant-chat c-mobile-ai-assistant-chat__not-config pws-ai-assistant-chat__not-config"
  >
    <img
      src="./image/robot-gray.png"
      class="c-mobile-ai-assistant-chat__not-config__image"
      :alt="$lang('ai.not.config')"
    />
    <p class="c-mobile-ai-assistant-chat__not-config__text">
      {{ $lang('ai.not.config') }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { PolyvAIAssistantChatStatus } from '@polyv/live-watch-sdk';

import MobileAiAssistantChatMsgList from './ai-assistant-chat-msg-list/mobile-ai-assistant-chat-msg-list.vue';
import MobileMsgInputWrap from '@/components/page-watch-common/msg-input-wrap/mobile-msg-input-wrap/mobile-msg-input-wrap.vue';
import { useAIAssistantChat } from './use-ai-assistant-chat';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePolyvAIStore } from '@/store/use-polyv-ai-store';

const {
  msgListRef,
  msgInputWrapRef,

  AIAssistantChatMsgRenderList,

  AIAssistantInputPlaceholder,
  onSubmitMessage,
} = useAIAssistantChat();

const { AIAssistantChatVisible, AIAssistantChatInputDisabled, AIAssistantChatStatus } =
  storeDefinitionToRefs(usePolyvAIStore);
</script>

<style lang="scss">
.c-mobile-ai-assistant-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.c-mobile-ai-assistant-chat__not-config {
  align-items: center;
  justify-content: center;

  .c-mobile-ai-assistant-chat__not-config__image {
    width: 112px;
    height: 112px;
  }

  .c-mobile-ai-assistant-chat__not-config__text {
    margin-top: 18px;
    color: #fff;
  }
}

.c-mobile-ai-assistant-chat__msg-list {
  flex: 1;
  overflow: hidden;
}
</style>
