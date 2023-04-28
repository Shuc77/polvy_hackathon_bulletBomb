<!-- @file PC 端提问消息列表 -->
<template>
  <div
    ref="scrollRef"
    class="c-mobile-ask-msg-list"
    @scroll="onScrollEvent"
  >
    <template v-for="(item, index) in askMsgList">
      <mobile-chat-msg-item
        :key="item.id"
        :chat-msg="item"
        :prev-chat-msg="askMsgList[index - 1]"
        :next-chat-msg="askMsgList[index + 1]"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import MobileChatMsgItem from '@/components/page-watch-common/chat/chat-msg-list/msg-items/mobile-chat-msg-item.vue';
import { askMsgListEmits, askMsgListProps, useAskMsgList } from './use-ask-msg-list';

defineProps(askMsgListProps());

const emit = defineEmits(askMsgListEmits());

const { scrollRef, askMsgListInstance, onScrollEvent } = useAskMsgList({ emit });

defineExpose(askMsgListInstance);
</script>

<style lang="scss">
.c-mobile-ask-msg-list {
  height: 100%;
  overflow-y: auto;
}
</style>
