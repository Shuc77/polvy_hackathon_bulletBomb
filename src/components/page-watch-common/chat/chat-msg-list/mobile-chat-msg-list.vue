<!-- @file 移动端聊天消息列表 -->
<template>
  <div class="c-mobile-chat-msg-list">
    <div
      ref="containerRef"
      class="c-mobile-chat-msg-list__container pws-main-tab-body-scrollbar"
    ></div>

    <span class="c-mobile-chat-msg-list__shadow-top pws-bg-none"></span>

    <div
      v-if="moreMsgVisible"
      class="c-mobile-chat-msg-list__more-msg pws-chat-msg-more-button"
      @click="scrollToNew"
    >
      {{ $lang('chat.moreMsg') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatMsgItemComponentOptions } from './hooks/msg-render-hook';
import MobileChatMsgItem from './msg-items/mobile-chat-msg-item.vue';
import { useChatMsgList } from './use-chat-msg-list';
import './styles/index.scss';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgStore } from '@/store/use-chat-msg-store';

const { moreMsgVisible } = storeDefinitionToRefs(useChatMsgStore);

const { containerRef, scrollToNew } = useChatMsgList({
  ChatMsgItemComponent: MobileChatMsgItem as ChatMsgItemComponentOptions,
});
</script>

<style lang="scss">
.c-mobile-chat-msg-list {
  position: relative;
  height: 100%;
  color: #adadc0;
}

.c-mobile-chat-msg-list__container {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain; // 阻止滚动传播
  @include scrollbar;
}

.c-mobile-chat-msg-list__shadow-top,
.c-mobile-chat-msg-list__shadow-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 8px;
  pointer-events: none;
  background-repeat: repeat-x;
  background-size: auto 100%;
}

.c-mobile-chat-msg-list__shadow-top {
  top: 0;
  background: linear-gradient(180deg, rgba(32, 33, 39, 1) 0%, rgba(32, 33, 39, 0) 100%);
}

.c-mobile-chat-msg-list__more-msg {
  position: absolute;
  bottom: 18px;
  left: 50%;
  z-index: 10;
  height: 34px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 34px;
  border-radius: 17px;
  opacity: 0.8;
  transform: translateX(-50%);
}
</style>
