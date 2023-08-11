<!-- @file PC 端入口 -->
<template>
  <div class="c-pc-main g-pc-main-layout">
    <pc-force-auth v-if="shouldShowForceAuth" />
    <pc-splash v-else-if="shouldShowSplash" />
    <pc-watch v-else-if="watchPageInited" />
  </div>
</template>

<script setup lang="ts">
import '@/plugins/polyv-ui/pc-import';
import { defineAsyncComponent } from 'vue';

import PcSplash from '@/pages/splash/pc-splash/pc-splash.vue';
import PcWatch from '@/pages/watch/pc-watch/pc-watch.vue';

import { useMainEnter } from './_hooks/use-main-enter';
import { usePageLayoutStyle } from './_hooks/use-page-layout-style';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const PcForceAuth = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "pc-force-auth" */ '@/pages/force-auth/pc-force-auth/pc-force-auth.vue'
  );
});

useMainEnter();
usePageLayoutStyle();

const {
  shouldShowForceAuth,

  shouldShowSplash,
  watchPageInited,
} = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/pc.scss"></style>
