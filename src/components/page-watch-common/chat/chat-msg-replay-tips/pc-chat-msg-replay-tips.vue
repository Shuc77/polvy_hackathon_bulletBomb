<!-- @file 聊天消息重放提示组件 - PC端 -->
<template>
  <transition name="fade">
    <div
      v-if="showTips"
      class="c-pc-chat-msg-replay-tips"
    >
      <pc-icon-warning-round-fill class="c-pc-chat-msg-replay-tips__icon" />

      <div class="c-pc-chat-msg-replay-tips__content">
        <span>{{ content }}</span>
      </div>

      <pc-icon-close
        class="c-pc-chat-msg-replay-tips__close"
        @click="onClickClose"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { PcIconClose, PcIconWarningRoundFill } from '@/components/component-icons/pc/map';
import { useChatMsgReplayTips } from './use-chat-msg-replay-tips';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

const { content } = useChatMsgReplayTips();

const { visible: showTips, close: onClickClose } = useSimpleVisible(true);
</script>

<style lang="scss">
.c-pc-chat-msg-replay-tips {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 10px;
  color: #333333;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 0 4px 0 rgba(#000, 0.08);
}

.c-pc-chat-msg-replay-tips__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
  color: #ff7a14;
}

.c-pc-chat-msg-replay-tips__content {
  flex: 1;
  font-size: 12px;
  line-height: 16px;
}

.c-pc-chat-msg-replay-tips__close {
  display: flex;
  align-items: center;
  width: 16px;
  height: 16px;
  font-size: 16px !important;
  cursor: pointer;
}
</style>
