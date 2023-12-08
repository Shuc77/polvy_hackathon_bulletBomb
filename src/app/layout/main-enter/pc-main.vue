<!-- @file PC 端入口 -->
<template>
  <div class="c-pc-main g-pc-main-layout">
    <pc-force-auth
      v-if="shouldShowForceAuth"
      @hook:mounted="onPageMounted"
    />
    <pc-splash
      v-else-if="shouldShowSplash"
      @hook:mounted="onPageMounted"
    />
    <pc-watch
      v-else-if="watchPageInited"
      @hook:mounted="onPageMounted"
    />
  </div>
</template>

<script setup lang="ts">
import '@/plugins/polyv-ui/pc-import';
import { defineAsyncComponent } from 'vue';

import { mainEnterEmits, useMainEnter } from './_hooks/use-main-enter';
import { usePageLayoutStyle } from './_hooks/use-page-layout-style';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const PcForceAuth = defineAsyncComponent(() => {
  return import(
    /* webpackChunkName: "pc-force-auth" */ '@/pages/force-auth/pc-force-auth/pc-force-auth.vue'
  );
});

const PcSplash = defineAsyncComponent(() => {
  return import(/* webpackChunkName: "pc-splash" */ '@/pages/splash/pc-splash/pc-splash.vue');
});

const PcWatch = defineAsyncComponent(() => {
  return import(/* webpackChunkName: "pc-watch" */ '@/pages/watch/pc-watch/pc-watch.vue');
});

const emit = defineEmits(mainEnterEmits());

const { onPageMounted } = useMainEnter({ emit });

usePageLayoutStyle();

const {
  shouldShowForceAuth,

  shouldShowSplash,
  watchPageInited,
} = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/pc.scss"></style>
