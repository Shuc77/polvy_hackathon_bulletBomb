<template>
  <div class="p-watch-identify">
    <!-- <div ref="renderContainer"></div> -->
    <watch-identify-login-page
      :lang="langStore.currentLang"
      :get-watch-identify-core="getWatchIdentifyCore"
      @success="onLoginSuccess"
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
import { defineComponent } from 'vue';
import { useLangStore } from '@/store/use-lang-store';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';
import { useGlobalInject } from '@/app/use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';

const { getWatchCore } = useGlobalInject();
const { redirectToErrorVerify } = useErrorVerify();
const { paramGetter } = useQueryParams();

const langStore = useLangStore();

// window.changeLang = (lang: any) => {
//   langStore.switchLang(lang);
// };

const watchCore = getWatchCore();

function getWatchIdentifyCore() {
  return watchCore.identity.getIdentifyCore();
}

function onLoginSuccess() {
  // 成功提交后刷新当前页面即可
  window.location.reload();
}

function onLoginFail() {
  redirectToErrorVerify({
    errorType: ErrorVerifyType.AuthFail,
  });
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
</script>

<style>
.p-watch-identify {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
