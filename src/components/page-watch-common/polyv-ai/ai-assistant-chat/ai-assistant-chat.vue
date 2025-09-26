<!-- @file 移动端横屏-AI助手答疑面板 -->

<template>
  <div class="c-ai-assistant-chat-wrapper">
    <ai-assistant-chat
      ref="assistantChatRef"
      direction="column"
      :audio-recognize-enabled="false"
      :digital-enabled="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLiveWatchAIUILoader } from '@/plugins/external-lib-loaders/load-ai-ui';
import { defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import { useAIGlobalProvider } from '../use-ai-global-provider';
import { useLayoutStore } from '@/store/use-layout-store';
import { TAB_NAME_AI_ASSISTANT } from '@/assets/constants/tab-name';
import type { AiAssistantChat as AiAssistantChatType } from '@polyv/live-watch-ai-ui';

const { watchAICore, watchCore } = useAIGlobalProvider();

const { loadLiveWatchAIUIComponent } = useLiveWatchAIUILoader();

const AiAssistantChat = defineAsyncComponent(() => loadLiveWatchAIUIComponent('AiAssistantChat'));

const assistantChatRef = ref<InstanceType<typeof AiAssistantChatType> | null>(null);

const layoutStore = useLayoutStore();

// 切到 Tab 时自动滚到最底部
watch(
  () => [layoutStore.mobileMenuCurrentName, layoutStore.pcAsideTabCurrentName],
  () => {
    if (!assistantChatRef.value) return;

    if (
      layoutStore.mobileMenuCurrentName === TAB_NAME_AI_ASSISTANT ||
      layoutStore.pcAsideTabCurrentName === TAB_NAME_AI_ASSISTANT
    ) {
      const msgListRef = assistantChatRef.value.getMsgListInstance();
      msgListRef?.scrollToBottom();
    }
  },
);

onBeforeMount(async () => {
  if (!watchAICore) return;

  const { aiAssistantId, aiAssistantName } = watchCore.polyvAI.getChannelRelatedAIAssistantInfo();

  watchAICore.aiAssistant.setupAIAssistant(
    {
      aiAssistantId,
      aiAssistantName,
    },
    { independent: false },
  );
});
</script>

<style lang="scss">
.c-ai-assistant-chat-wrapper {
  width: 100%;
  height: 100%;

  .plv-ai-msg-input-wrap__button {
    min-width: 56px;
  }
}
</style>
