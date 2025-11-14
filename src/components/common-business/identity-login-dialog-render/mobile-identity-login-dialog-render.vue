<template>
  <div class="c-mobile-identity-login-dialog-render">
    <mobile-message-box
      ref="messageBoxRef"
      :content="messageBoxContent"
      content-center
      :confirm-button-text="$lang('auth.login.button')"
      :cancel-button-text="$lang('base.cancel')"
      :position-type="positionType"
      :confirm-button-weixin-id="weixinBtnSelectorId"
    />
    <!-- 用户体系登录弹层 -->
    <watch-identify-login-content
      :visible="contentDialogVisible"
      display-mode="popup"
      @guest-auth-success="setupLinkData"
      @popup-close="closeContentDialog"
    />
  </div>
</template>

<script lang="ts" setup>
import { MobileMessageBox } from '@/components/common-base/message-box/index';
import { useIdentityLoginDialogRender } from './use-identity-login-dialog-render';
import WatchIdentifyLoginContent from './watch-identify-login-content.vue';

const {
  setupLinkData,
  weixinBtnSelectorId,

  messageBoxRef,
  messageBoxContent,
  positionType,

  contentDialogVisible,
  closeContentDialog,
} = useIdentityLoginDialogRender();
</script>
