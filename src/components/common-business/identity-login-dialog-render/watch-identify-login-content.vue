<template>
  <watch-identify-login-page
    :popup-visible="visible"
    :display-mode="displayMode"
    :lang="langStore.currentLang"
    :get-watch-identify-core="getWatchIdentifyCore"
    :direct-auth-params="identityStore.getDirectAuthParams()"
    @success="onLoginSuccess"
    @guest-auth-success="onGuestAuthSuccess"
    @fail="onLoginFail"
    @popup-close="onPopupClose"
  />
</template>

<script lang="ts" setup>
import { useWatchIdentifySDKSceneLoader } from '@/plugins/external-lib-loaders/load-watch-identify-ui-default';
import { isMobile } from '@/assets/utils/browser';
import { defineComponent } from 'vue';
import { useIdentityStore } from '@/store/use-identity-store';
import { useLangStore } from '@/store/use-lang-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { PropUtils, emitFunc } from '@polyv/vue-components';

const { getMobilePolyvWatchIdentifySDKSceneComponent, getPcPolyvWatchIdentifySDKSceneComponent } =
  useWatchIdentifySDKSceneLoader();

const WatchIdentifyLoginPage = defineComponent(() => {
  const MobileWatchIdentifyLoginPage = () =>
    getMobilePolyvWatchIdentifySDKSceneComponent('MobileWatchIdentifyLoginPage');

  const PcWatchIdentifyLoginPage = () =>
    getPcPolyvWatchIdentifySDKSceneComponent('PcWatchIdentifyLoginPage');

  return isMobile ? MobileWatchIdentifyLoginPage() : PcWatchIdentifyLoginPage();
});

defineProps({
  visible: PropUtils.bool.def(true),
  displayMode: PropUtils.string.def('page'),
});

const emits = defineEmits({
  'guest-auth-success': emitFunc<void>(),
  'popup-close': emitFunc<void>(),
});

function onPopupClose() {
  emits('popup-close');
}

const { getWatchCore } = useGlobalInject();
const { redirectToErrorVerify } = useErrorVerify();
const identityStore = useIdentityStore();
const langStore = useLangStore();

const watchCore = getWatchCore();

function getWatchIdentifyCore() {
  return watchCore.identity.getIdentifyCore();
}

function onLoginSuccess() {
  // 成功提交后刷新当前页面即可
  window.location.reload();
}

function onGuestAuthSuccess() {
  emits('guest-auth-success');
}

function onLoginFail() {
  redirectToErrorVerify({
    errorType: ErrorVerifyType.AuthFail,
  });
}
</script>
