<template>
  <div :id="uniqueId">
    <direct-business-page-entry
      v-if="directBusinessPageType"
      @hook:mounted="onLayoutMounted"
    />
    <template v-if="!directBusinessPageType && watchAppInited">
      <pc-main
        v-if="!isMobile"
        @page-mounted="onLayoutMounted"
      />
      <mobile-main
        v-else
        @page-mounted="onLayoutMounted"
      />
    </template>

    <theme-select v-if="watchAppInited && paramGetter().debugSkin()" />
    <effect-workbench-entry v-if="effectEditorVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useWatchApp } from './use-watch-app';
import { isMobile } from '@/assets/utils/browser';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import DirectBusinessPageEntry from './layout/direct-business-page/direct-business-page-entry.vue';
import { useGlobalInject } from './use-global-inject';
import { useQueryParams } from '@/hooks/core/use-query-params';

const { uniqueId } = useGlobalInject();
const { paramGetter } = useQueryParams();

const ThemeSelect = defineAsyncComponent(
  () => import(/* webpackChunkName: "theme-select" */ '@/themes/debug/theme-select.vue'),
);

/**
 * 特效配置入口
 * @desc 入口自己再异步拉起工作台浮层，所以这里不 import 特效 store ——
 *   在 watch-app 这一层碰 store 会把 6 个模板的注册表拖进主包
 */
const EffectWorkbenchEntry = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "effect-editor" */ '@/components/page-watch-common/barrage-effect/editor/effect-workbench-entry.vue'
    ),
);

const PcMain = defineAsyncComponent(
  () => import(/* webpackChunkName: "pc-main" */ './layout/main-enter/pc-main.vue'),
);
const MobileMain = defineAsyncComponent(
  () => import(/* webpackChunkName: "mobile-main" */ './layout/main-enter/mobile-main.vue'),
);

// eslint-disable-next-line no-unused-vars
const { onLayoutMounted, setupWatchApp } = useWatchApp();
// useCurrentWatchAppEffect(setupWatchApp);

const { directBusinessPageType, watchAppInited } = storeDefinitionToRefs(useWatchAppStore);

/**
 * 是否展示弹幕特效配置入口
 * @desc 默认常驻，传 `?effectEditor=0` 可关闭。
 * 工作台只在 PC 端开放：手机页只消费编排好的特效，不提供编辑器入口；
 * 自建业务页也没有这层播放器渲染，同样不渲染
 */
const effectEditorVisible = computed(() => {
  return (
    watchAppInited.value &&
    !directBusinessPageType.value &&
    !isMobile &&
    paramGetter().effectEditor()
  );
});
</script>

<style lang="scss" src="@/assets/styles/global.scss"></style>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
