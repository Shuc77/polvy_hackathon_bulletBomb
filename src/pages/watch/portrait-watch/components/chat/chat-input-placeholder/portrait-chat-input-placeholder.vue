<!-- @file 竖屏端聊天室输入框占位 -->
<template>
  <div
    class="c-portrait-chat-input-placeholder"
    :class="{
      'c-portrait-chat-input-placeholder--disabled': chatInputDisabled,
      'c-portrait-chat-input-placeholder--round': playbackChapterEntranceVisible,
    }"
    @click="onClickPlaceholder"
  >
    <template v-if="!playbackChapterEntranceVisible">
      <mobile-icon-message class="c-portrait-chat-input-placeholder__icon" />
      <span class="c-portrait-chat-input-placeholder__text g-singleline">
        {{ chatInputPlaceholder }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MobileIconMessage } from '@/components/component-icons/mobile/map';
import { appEvents, eventBus } from '@/app/app-events';
import { useChatStore } from '@/store/use-chat-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed, unref } from 'vue';

const { chatInputPlaceholder, chatInputDisabled } = storeDefinitionToRefs(useChatStore);

const { hasNickname } = storeDefinitionToRefs(useViewerStore);

const { isPlaybacking, playbackListVisible, chapterEnabled } =
  storeDefinitionToRefs(usePlaybackStore);

const playbackChapterEntranceVisible = computed<boolean>(() => {
  return isPlaybacking.value && (unref(playbackListVisible) || unref(chapterEnabled));
});

function onClickPlaceholder() {
  // 输入框禁用
  if (unref(chatInputDisabled)) {
    return;
  }

  // 未设置昵称
  if (!unref(hasNickname)) {
    eventBus.$emit(appEvents.chat.OpenSetNick, true);
    return;
  }

  eventBus.$emit(appEvents.chat.FocusToChatInput);
}
</script>

<style lang="scss">
.c-portrait-chat-input-placeholder {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 165px;
  height: 32px;
  padding: 0 8px;
  line-height: 32px;
  background-color: rgba(#000000, 0.4);
  border-radius: 16px;
}
.c-portrait-chat-input-placeholder__icon {
  display: flex;
  flex-shrink: 0;
  margin-right: 6px;
  font-size: 16px !important;
}

.c-portrait-chat-input-placeholder__text {
  flex: 1;
  font-size: 14px;
  color: rgba($--color-white, 0.6);
}

.c-portrait-chat-input-placeholder--round {
  width: 32px;
  height: 32px;
  background-image: url(./images/icon-send-msg.png);
  background-size: 100%;
}
</style>
