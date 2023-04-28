<!-- @file 移动端入口 -->
<template>
  <div class="c-mobile-main">
    <!-- Warn: 弹窗需要放在前面，不然内部使用 appendToBody 的时候会阻塞观看页渲染 -->
    <!-- 风险测评 -->
    <mobile-risk-evaluation />
    <risk-evaluation-redirect-dialog />
    <!-- 风险确认函 -->
    <mobile-risk-confirm-letter />

    <template v-if="shouldShowSplash">
      <mobile-splash v-if="!mobileSplashIsLarge" />
      <mobile-splash-full v-else />
    </template>

    <template v-else-if="liveWatchInited">
      <portrait-watch v-if="mobileWatchLayout === ChannelWatchLayout.Portrait" />
      <mobile-watch v-if="mobileWatchLayout === ChannelWatchLayout.Normal" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { ChannelWatchLayout } from '@polyv/live-watch-sdk';

import MobileSplash from '@/pages/splash/mobile-splash/mobile-splash.vue';
import MobileSplashFull from '@/pages/splash/mobile-splash/mobile-splash-full.vue';
import RiskEvaluationRedirectDialog from '@/components/page-watch-common/interactive-receive/risk-evaluation/common/risk-evaluation-redirect-dialog.vue';
import MobileRiskEvaluation from '@/components/page-watch-common/interactive-receive/risk-evaluation/mobile-risk-evaluation.vue';
import MobileRiskConfirmLetter from '@/components/common-business/risk-confirm-letter/mobile-risk-confirm-letter.vue';

import { useMainEnter } from './_hooks/use-main-enter';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const MobileWatchLoader = () => {
  return import(
    /* webpackChunkName: "watch-mobile" */ '@/pages/watch/mobile-watch/mobile-watch.vue'
  );
};
const MobileWatch = defineAsyncComponent(MobileWatchLoader);

const PortraitWatchLoader = () => {
  return import(
    /* webpackChunkName: "portrait-watch" */ '@/pages/watch/portrait-watch/portrait-watch.vue'
  );
};
const PortraitWatch = defineAsyncComponent(PortraitWatchLoader);

const { mobileWatchLayout, isPortraitWatchLayout } = storeDefinitionToRefs(useChannelStore);

const { shouldShowSplash, liveWatchInited } = storeDefinitionToRefs(useWatchAppStore);

const { mobileSplashIsLarge } = storeDefinitionToRefs(useLayoutStore);

useMainEnter({
  watchLoader: () => {
    if (isPortraitWatchLayout.value) {
      return PortraitWatchLoader();
    } else {
      return MobileWatchLoader();
    }
  },
});
</script>

<style lang="scss" src="@/assets/styles/mobile.scss"></style>

<style lang="scss">
.c-mobile-main {
  width: 100%;
  height: 100%;
}
</style>
