<!-- @file 聊天消息重放提示组件 - 移动端横屏 -->
<template>
  <transition name="fade">
    <div
      v-if="showTips"
      class="c-mobile-chat-msg-replay-tips"
    >
      <mobile-icon-warning-round-fill class="c-mobile-chat-msg-replay-tips__icon" />

      <div class="c-mobile-chat-msg-replay-tips__content">
        <span>{{ content }}</span>
      </div>

      <mobile-icon-close
        class="c-mobile-chat-msg-replay-tips__close"
        @click="onClickClose"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import {
  MobileIconClose,
  MobileIconWarningRoundFill,
} from '@/components/component-icons/mobile/map';
import { useChatMsgReplayTips } from './use-chat-msg-replay-tips';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

const { content } = useChatMsgReplayTips();

const { visible: showTips, close: onClickClose } = useSimpleVisible(true);
</script>

<style lang="scss">
.c-mobile-chat-msg-replay-tips {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  color: #333333;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 0 4px 0 rgba(#000, 0.08);
}

.c-mobile-chat-msg-replay-tips__icon {
  display: flex;
  margin-right: 12px;
  font-size: 16px !important;
  color: #ff7a14;
}

.c-mobile-chat-msg-replay-tips__content {
  flex: 1;
  font-size: 14px;
  line-height: 16px;
}

.c-mobile-chat-msg-replay-tips__close {
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  font-size: 20px !important;
  cursor: pointer;
}
</style>
