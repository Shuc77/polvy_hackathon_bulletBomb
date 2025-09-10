<template>
  <div class="p-watch-identify">
    <watch-identify-login-page
      v-show="pageVisible"
      :lang="langStore.currentLang"
      :get-watch-identify-core="getWatchIdentifyCore"
      @success="onLoginSuccess"
      @guest-login-success="onGuestLoginSuccess"
      :direct-auth-params="{
        externalViewerId: paramGetter().externalViewerId(),
        nickname: paramGetter().nickname(),
        ts: paramGetter().ts(),
        param4: paramGetter().param4(),
        param5: paramGetter().param5(),
        sign: paramGetter().sign(),
        avatar: paramGetter().avatar(),
      }"
      @fail="onLoginFail"
    />
  </div>
</template>

<script lang="ts" setup>
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { isMobile } from '@/assets/utils/browser';
import { defineComponent, ref, onBeforeMount } from 'vue';
import { useLangStore } from '@/store/use-lang-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { useGlobalInject } from '@/app/use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useChannelStore } from '@/store/use-channel-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { messageBox, MessageBoxPositionType } from '@/components/common-base/message-box';
import { translate } from '@/assets/lang';
import { appEvents, useEventBusListener } from '@/app/app-events';

const { getWatchCore, getEmitter } = useGlobalInject();
const { redirectToErrorVerify } = useErrorVerify();
const { paramGetter } = useQueryParams();
const identityStore = useIdentityStore();
const channelStore = useChannelStore();
const langStore = useLangStore();

const watchCore = getWatchCore();

const isFeedMainMode = isBuildForFeedMainMode();

const pageVisible = ref(true);

const emitter = getEmitter();

let loginDialogVisible = false;

async function handleLoginDialog(): Promise<boolean> {
  if (loginDialogVisible) return false;
  loginDialogVisible = true;
  const res = await messageBox({
    content: translate('auth.login.tips.ppt'),
    confirmButtonText: translate('auth.login.button'),
    contentCenter: true,
    cancelButtonText: translate('auth.login.tips.continue'),
    positionType: MessageBoxPositionType.Absolute,
  }).$confirm();
  loginDialogVisible = false;
  if (res) {
    pageVisible.value = true;
    return true;
  } else {
    emitter.emit(appEvents.global.SlideToNextFeedSwiper);
  }

  return false;
}

function getWatchIdentifyCore() {
  return watchCore.identity.getIdentifyCore();
}

function onLoginSuccess() {
  // 成功提交后刷新当前页面即可
  window.location.reload();
}

function onGuestLoginSuccess() {
  if (!identityStore.checkAllowUseGuest()) {
    identityStore.resetGuest();
    return;
  }

  // 当前已经是游客状态代表已经进入过主页面，无需再刷新，继续走登录流程
  if (identityStore.isGuest) {
    identityStore.resetGuest();
  } else {
    pageVisible.value = false;
    window.location.reload();
  }
}

function onLoginFail() {
  redirectToErrorVerify({
    errorType: ErrorVerifyType.AuthFail,
  });
}

function onPageActive() {
  if (channelStore.isPptChannel && isFeedMainMode) {
    handleLoginDialog();
  }
}

const { getMobilePolyvWatchIdentifySDKSceneComponent, getPcPolyvWatchIdentifySDKSceneComponent } =
  useWatchIdentifySDKSceneLoader();

const WatchIdentifyLoginPage = defineComponent(() => {
  const MobileWatchIdentifyLoginPage = () =>
    getMobilePolyvWatchIdentifySDKSceneComponent('MobileWatchIdentifyLoginPage');

  const PcWatchIdentifyLoginPage = () =>
    getPcPolyvWatchIdentifySDKSceneComponent('PcWatchIdentifyLoginPage');

  return isMobile ? MobileWatchIdentifyLoginPage() : PcWatchIdentifyLoginPage();
});

useEventBusListener(appEvents.global.PageActive, onPageActive);

onBeforeMount(() => {
  if (channelStore.isPptChannel && isFeedMainMode) {
    pageVisible.value = false;
    handleLoginDialog();
  }
});
</script>

<style>
.p-watch-identify {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
