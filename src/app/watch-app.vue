<template>
  <div id="app">
    <page-error-entry
      v-if="pageError"
      @hook:mounted="onLayoutMounted"
    />
    <template v-if="!pageError && watchAppInited">
      <pc-main
        v-if="!isMobile"
        @hook:mounted="onLayoutMounted"
      />
      <mobile-main
        v-else
        @hook:mounted="onLayoutMounted"
      />
    </template>

    <!-- <skin-select /> -->
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useWatchApp } from './use-watch-app';
import { isMobile } from '@/assets/utils/browser';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import PageErrorEntry from './layout/page-error/page-error-entry.vue';
// import SkinSelect from '../skins/_debug/skin-select.vue';

const PcMain = defineAsyncComponent(
  () => import(/* webpackChunkName: "pc-main" */ './layout/main-enter/pc-main.vue'),
);
const MobileMain = defineAsyncComponent(
  () => import(/* webpackChunkName: "mobile-main" */ './layout/main-enter/mobile-main.vue'),
);

const { onLayoutMounted } = useWatchApp();

const { pageError, watchAppInited } = storeDefinitionToRefs(useWatchAppStore);
</script>

<style lang="scss" src="@/assets/styles/global.scss"></style>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
