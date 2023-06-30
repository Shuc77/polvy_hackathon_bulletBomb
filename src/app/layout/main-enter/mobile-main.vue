<!-- @file 移动端入口 -->
<template>
  <div class="c-mobile-main">
    <template v-if="shouldShowSplash">
      <mobile-splash v-if="mobileSplashLayout === MobileSplashLayout.Normal" />
      <mobile-splash-full v-if="mobileSplashLayout === MobileSplashLayout.Large" />
    </template>

    <template v-else-if="watchPageInited">
      <portrait-watch v-if="mobileWatchLayout === MobileWatchLayout.Portrait" />
      <mobile-watch v-if="mobileWatchLayout === MobileWatchLayout.Normal" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { MobileSplashLayout, MobileWatchLayout } from '@polyv/live-watch-sdk';
import { defineAsyncComponent } from 'vue';

import MobileSplashFull from '@/pages/splash/mobile-splash/mobile-splash-full.vue';
import MobileSplash from '@/pages/splash/mobile-splash/mobile-splash.vue';

import { useMainEnter } from './_hooks/use-main-enter';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

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

const { shouldShowSplash, watchPageInited } = storeDefinitionToRefs(useWatchAppStore);

const { mobileSplashLayout, mobileWatchLayout, isPortraitWatchLayout } =
  storeDefinitionToRefs(useLayoutStore);

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
