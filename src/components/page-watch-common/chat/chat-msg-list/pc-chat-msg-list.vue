<!-- @file PC 端聊天消息列表 -->
<template>
  <div class="c-pc-chat-msg-list">
    <div
      ref="containerRef"
      class="c-pc-chat-msg-list__container pws-main-tab-body-scrollbar"
    ></div>

    <div
      v-if="moreMsgVisible"
      class="c-pc-chat-msg-list__more-msg pws-chat-msg-more-button"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg') }}
    </div>

    <span class="c-pc-chat-msg-list__shadow-top pws-bg-none"></span>
    <span class="c-pc-chat-msg-list__shadow-bottom pws-bg-none"></span>
  </div>
</template>

<script setup lang="ts">
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import PcChatMsgItem from './msg-items/pc-chat-msg-item.vue';
import { useChatMsgList } from './use-chat-msg-list';
import './styles/index.scss';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);

const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: PcChatMsgItem as ChatMsgItemComponentOptions,
});
</script>

<style lang="scss">
.c-pc-chat-msg-list {
  position: relative;
  height: 100%;
}

.c-pc-chat-msg-list__container {
  position: relative;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain; // 阻止滚动传播
  @include scrollbar;
}

.c-pc-chat-msg-list__shadow-top,
.c-pc-chat-msg-list__shadow-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 8px;
  pointer-events: none;
  background-repeat: repeat-x;
  background-size: auto 100%;
}

.c-pc-chat-msg-list__more-msg {
  position: absolute;
  bottom: 36px;
  left: 50%;
  z-index: 10;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  border-radius: 16px;
  opacity: 0.8;
  transform: translateX(-50%);
}

.c-pc-chat-msg-list__shadow-top {
  top: 0;
  background: linear-gradient(180deg, #202127 0%, rgba(32, 33, 39, 0) 100%);
}
.c-pc-chat-msg-list__shadow-bottom {
  bottom: 0;
  background: linear-gradient(180deg, rgba(32, 33, 39, 0) 0%, #202127 100%);
}
</style>
