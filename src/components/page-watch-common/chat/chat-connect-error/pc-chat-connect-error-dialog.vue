<!-- @file PC 端聊天室连接失败弹窗 -->
<template>
  <pc-dialog
    class="c-pc-chat-connect-error-dialog"
    :visible.sync="connectErrorVisible"
    :title="$lang('base.warmTips')"
    :closable="false"
    :width="360"
  >
    <div class="c-pc-chat-connect-error-dialog__tips">
      {{ errorTipsText }}
    </div>
    <div class="c-pc-chat-connect-error-dialog__buttons">
      <normal-button
        class="c-pc-chat-connect-error-dialog__button"
        :text="$lang('base.cancel')"
        :type="ButtonType.Cancel"
        :size="ButtonSize.Small"
        @click="onCancel"
      />
      <normal-button
        class="c-pc-chat-connect-error-dialog__button"
        :text="$lang('base.confirm')"
        :size="ButtonSize.Small"
        @click="onConfirm"
      />
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useChatConnectError } from './use-chat-connect-error';

const { connectErrorVisible, errorTipsText, onConfirm, onCancel } = useChatConnectError();
</script>

<style lang="scss">
.c-pc-chat-connect-error-dialog__tips {
  padding-top: 40px;
  padding-bottom: 24px;
  font-size: 14px;
  text-align: center;
}
.c-pc-chat-connect-error-dialog__buttons {
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
}
.c-pc-chat-connect-error-dialog__button + .c-pc-chat-connect-error-dialog__button {
  margin-left: 16px;
}
</style>
