<template>
  <div
    v-if="renderEnabled"
    class="c-mobile-identity-login-dialog-render"
  >
    <mobile-watch-identity-guest-login-splash-dialog
      ref="messageBoxRef"
      :content="messageBoxContent"
      content-center
      :confirm-button-text="$lang('auth.login.button')"
      :cancel-button-text="$lang('base.cancel')"
      :get-link-data="getLinkData"
    />
    <!-- 用户体系登录弹层 -->
    <watch-identify-login-content
      :visible="contentDialogVisible"
      display-mode="popup"
      :wx-auto-auth-enabled="false"
      @popup-close="closeContentDialog"
    />
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { useIdentityLoginDialogRender } from './use-identity-login-dialog-render';

import WatchIdentifyLoginContent from './watch-identify-login-content.vue';

const { getMobilePolyvWatchIdentifySDKSceneComponent } = useWatchIdentifySDKSceneLoader();

const MobileWatchIdentityGuestLoginSplashDialog = defineComponent(() => {
  return getMobilePolyvWatchIdentifySDKSceneComponent('MobileWatchIdentityGuestLoginSplashDialog');
});

const {
  renderEnabled,
  getLinkData,

  messageBoxRef,
  messageBoxContent,

  contentDialogVisible,
  closeContentDialog,
} = useIdentityLoginDialogRender();
</script>
