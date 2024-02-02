<!-- @file PC 端提问消息列表 -->
<template>
  <div
    ref="scrollRef"
    class="c-pc-ask-msg-list pws-main-tab-body-scrollbar"
    @scroll="onScrollEvent"
  >
    <template v-for="(item, index) in askMsgList">
      <pc-chat-msg-item
        :category="ChatMsgItemCategory.Ask"
        :key="item.id"
        :chat-msg="item"
        :prev-chat-msg="askMsgList[index - 1]"
        :next-chat-msg="askMsgList[index + 1]"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import PcChatMsgItem from '@/components/page-watch-common/chat/chat-msg-list/msg-items/pc-chat-msg-item.vue';
import { ChatMsgItemCategory } from '../../chat/chat-msg-list/msg-items/use-chat-msg-item';
import { askMsgListEmits, askMsgListProps, useAskMsgList } from './use-ask-msg-list';

defineProps(askMsgListProps());

const emit = defineEmits(askMsgListEmits());

const { scrollRef, askMsgListInstance, onScrollEvent } = useAskMsgList({ emit });

defineExpose(askMsgListInstance);
</script>

<style lang="scss">
.c-pc-ask-msg-list {
  height: 100%;
  overflow-y: auto;
  color: #adadc0;
  @include scrollbar;
}
</style>
