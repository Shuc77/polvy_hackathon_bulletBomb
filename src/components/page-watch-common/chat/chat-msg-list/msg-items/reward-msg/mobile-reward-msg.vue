<!-- @file 移动端打赏消息 -->
<template>
  <div
    class="c-mobile-reward-msg pws-chat-reward-msg"
    :class="{
      'c-mobile-reward-msg--continuity': isContinuitySourceMsg,
    }"
  >
    <!-- 礼物打赏 -->
    <template v-if="chatMsg.donateType === DonateType.Good">
      <span>
        {{ translateNick(chatMsg.user.nick) }}
        {{ $lang('donate.goodAction') }}
        {{ translateGoodName(chatMsg.rewardContent) }}
      </span>
      <div
        class="c-mobile-reward-msg__pic g-img-cover"
        :style="{
          backgroundImage: `url(${chatMsg.gimg})`,
        }"
      ></div>
    </template>

    <!-- 现金打赏 -->
    <template v-if="chatMsg.donateType === DonateType.Cash">
      <span>
        {{ translateNick(chatMsg.user.nick) }}
        {{ $lang('donate.cashAction') }}
        {{ chatMsg.rewardContent }}
      </span>
      <div class="c-mobile-reward-msg__pic c-mobile-reward-msg__pic--redpaper g-img-cover"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDonateStore } from '@/store/use-donate-store';
import { useLangStore } from '@/store/use-lang-store';
import { ChatMsgRewardType, DonateType } from '@polyv/live-watch-sdk';
import { useChatMsgComputedInject } from '../_hooks/chat-msg-computed-hook';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

const { chatMsg } = useChatMsgDataInject<ChatMsgRewardType>();

const { isContinuitySourceMsg } = useChatMsgComputedInject();

const { translateNick } = useLangStore();

const { translateGoodName } = useDonateStore();
</script>

<style lang="scss">
@import '../_styles/vars.scss';

.c-mobile-reward-msg {
  margin: 0 $--margin-horizontal-margin;
  font-size: 12px;
  text-align: center;
  word-break: break-word;
}
.c-mobile-reward-msg__pic {
  display: inline-block;
  width: 48px;
  height: 48px;
  margin: 0 4px 0 8px;
  vertical-align: middle;
}
.c-mobile-reward-msg__pic--redpaper {
  background-image: url(./imgs/icon-redpaper.png);
}
</style>
