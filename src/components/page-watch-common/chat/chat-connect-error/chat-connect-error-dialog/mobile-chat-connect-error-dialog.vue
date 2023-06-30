<!-- @file 移动端聊天室连接失败弹窗 -->
<template>
  <transition name="fade">
    <div
      v-show="connectErrorVisible"
      ref="wrapRef"
      class="c-mobile-chat-connect-error-dialog"
    >
      <div class="c-mobile-chat-connect-error-dialog__content">
        <p>{{ errorDialogContentText }}</p>
        <div class="c-mobile-chat-connect-error-dialog__btns">
          <normal-button
            class="c-mobile-chat-connect-error-dialog__btns__item"
            :text="$lang('base.ignore')"
            :size="ButtonSize.Small"
            :type="ButtonType.Cancel"
            @click="onCancel"
          />
          <normal-button
            class="c-mobile-chat-connect-error-dialog__btns__item"
            :text="$lang('base.confirm')"
            :size="ButtonSize.Small"
            :type="isPortraitWatchLayout ? ButtonType.Portrait : ButtonType.Primary"
            @click="onConfirm"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { ref } from 'vue';
import { useChatConnectError } from '../use-chat-connect-error';

const { connectErrorVisible, errorDialogContentText, onConfirm, onCancel } = useChatConnectError();

const wrapRef = ref<HTMLDivElement>();

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

useAppendTo(wrapRef);
</script>

<style lang="scss">
.c-mobile-chat-connect-error-dialog {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(#000000, 0.6);
}

.c-mobile-chat-connect-error-dialog__content {
  box-sizing: border-box;
  width: 280px;
  padding: 48px 24px 24px;
  font-size: 16px;
  color: $--font-color-primary;
  text-align: center;
  background-color: $--color-white;
  border-radius: 4px;

  p {
    margin-bottom: 28px;
    line-height: 24px;
  }
}

.c-mobile-chat-connect-error-dialog__btns__item {
  & + & {
    margin-left: 16px;
  }
}
</style>
