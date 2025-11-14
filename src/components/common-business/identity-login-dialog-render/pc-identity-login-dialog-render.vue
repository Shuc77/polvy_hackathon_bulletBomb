<template>
  <div class="c-pc-identity-login-dialog-render">
    <!-- 游客引导登录确认窗 -->
    <pc-message-box
      ref="messageBoxRef"
      :title="$lang('base.warmTips')"
      :content="messageBoxContent"
      content-center
      :width="360"
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
import { PcMessageBox } from '@/components/common-base/message-box/index';
import WatchIdentifyLoginContent from './watch-identify-login-content.vue';

import { useIdentityLoginDialogRender } from './use-identity-login-dialog-render';

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
