<!-- @file PC 端聊天室连接异常提示组件 -->
<template>
  <transition name="fade">
    <div
      v-if="connectErrorVisible"
      class="c-pc-chat-connect-error-tips"
    >
      <pc-icon-warning-round-fill class="c-pc-chat-error-tips__icon" />

      <div class="c-pc-chat-error-tips__content">
        <span>{{ errorTipsText }}</span>
      </div>

      <div class="c-pc-chat-connect-error-tips__button__wrap">
        <normal-button
          class="c-pc-chat-connect-error-tips__button--cancel"
          :type="ButtonType.Custom"
          :size="ButtonSize.XMini"
          :text="$lang('base.ignore')"
          @click="onCancel"
        />
        <normal-button
          class="c-pc-chat-connect-error-tips__button--confirm"
          :type="ButtonType.Custom"
          :size="ButtonSize.XMini"
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
import { PcIconWarningRoundFill } from '@/components/component-icons/pc/map';

import { useChatConnectError } from '../use-chat-connect-error';

const { connectErrorVisible, errorTipsText, onConfirm, onCancel } = useChatConnectError();
</script>

<style lang="scss">
.c-pc-chat-connect-error-tips {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #fff;
  cursor: default;
  background: #ff6767;
  border-radius: 4px;
}

.c-pc-chat-error-tips__icon {
  display: flex;
  margin-right: 8px;
  font-size: 16px !important;
}

.c-pc-chat-error-tips__content {
  flex: 1;
  font-size: 12px;
}

.c-pc-chat-connect-error-tips__button__wrap {
  display: flex;
}
.c-pc-chat-connect-error-tips__button--cancel {
  margin-right: 4px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}
.c-pc-chat-connect-error-tips__button--confirm {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #fff;
}
</style>
