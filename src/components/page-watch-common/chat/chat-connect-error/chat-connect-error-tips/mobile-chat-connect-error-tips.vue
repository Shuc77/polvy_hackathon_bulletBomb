<!-- @file 聊天室连接异常提示组件，仅移动端横屏使用 -->
<template>
  <transition name="fade">
    <div
      v-if="connectErrorVisible"
      class="c-mobile-chat-connect-error-tips"
    >
      <mobile-icon-warning-round-fill class="c-mobile-chat-error-tips__icon" />

      <div class="c-mobile-chat-error-tips__content">
        <span>{{ errorTipsText }}</span>
      </div>

      <div class="c-mobile-chat-connect-error-tips__button__wrap">
        <normal-button
          class="c-mobile-chat-connect-error-tips__button--cancel"
          :type="ButtonType.Custom"
          :size="ButtonSize.Mini"
          :text="$lang('base.ignore')"
          @click="onCancel"
        />
        <normal-button
          class="c-mobile-chat-connect-error-tips__button--confirm"
          :type="ButtonType.Custom"
          :size="ButtonSize.Mini"
          :text="$lang('base.refresh')"
          @click="onConfirm"
        />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { MobileIconWarningRoundFill } from '@/components/component-icons/mobile/map';

import { useChatConnectError } from '../use-chat-connect-error';

const { connectErrorVisible, errorTipsText, onConfirm, onCancel } = useChatConnectError();
</script>

<style lang="scss">
.c-mobile-chat-connect-error-tips {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #fff;
  background: #ff6767;
  border-radius: 4px;
}

.c-mobile-chat-error-tips__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
}

.c-mobile-chat-error-tips__content {
  flex: 1;
  font-size: 14px;
}

.c-mobile-chat-error-tips__close {
  display: flex;
  margin-left: 8px;
  font-size: 16px !important;
  cursor: pointer;
}

.c-mobile-chat-connect-error-tips__button__wrap {
  display: flex;
}
.c-mobile-chat-connect-error-tips__button--cancel {
  margin-right: 4px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}
.c-mobile-chat-connect-error-tips__button--confirm {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #fff;
}
</style>
