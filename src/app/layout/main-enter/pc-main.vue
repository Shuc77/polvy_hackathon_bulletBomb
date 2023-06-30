<!-- @file PC 端入口 -->
<template>
  <div class="c-pc-main">
    <pc-splash v-if="shouldShowSplash" />
    <pc-watch v-else-if="watchPageInited" />
  </div>
</template>

<script setup lang="ts">
import '@/plugins/polyv-ui/pc-import';
import PcSplash from '@/pages/splash/pc-splash/pc-splash.vue';
import PcWatch from '@/pages/watch/pc-watch/pc-watch.vue';

import { useMainEnter } from './_hooks/use-main-enter';
import { usePageLayoutStyle } from './_hooks/use-page-layout-style';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

useMainEnter();
usePageLayoutStyle();

const { shouldShowSplash, watchPageInited } = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/pc.scss"></style>
