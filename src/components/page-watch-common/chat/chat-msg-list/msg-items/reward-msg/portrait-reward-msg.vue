<!-- @file 竖屏端打赏消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-reward-msg"
    hide-user-info
  >
    <span class="c-portrait-reward-msg__nick">{{ translateNick(chatMsg.user.nick) }}</span>
    <span>{{ $lang('donate.goodAction') }}</span>
    <span>“{{ translateGoodName(chatMsg.rewardContent) }}”</span>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import { useDonateStore } from '@/store/use-donate-store';
import { useLangStore } from '@/store/use-lang-store';
import { ChatMsgRewardType } from '@polyv/live-watch-sdk';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';

const { chatMsg } = useChatMsgDataInject<ChatMsgRewardType>();

const { translateNick } = useLangStore();

const { translateGoodName } = useDonateStore();
</script>

<style lang="scss">
.c-portrait-reward-msg__nick {
  margin-right: 4px;
  color: #ffd16b;
}
</style>
