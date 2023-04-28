<!-- @file 竖屏端页面布局 -->
<template>
  <div class="c-portrait-watch-layout">
    <!-- 播放器 -->
    <div class="c-portrait-watch-layout__player-wrap">
      <portrait-player-main />
    </div>

    <!-- 文档 -->
    <div
      v-if="canRenderDoc"
      class="c-portrait-watch-layout__doc-wrap"
      :style="{
        height: `${portraitDocWrapHeight}px`,
      }"
    >
      <div
        class="c-portrait-watch-layout__doc-content"
        :style="{
          height: `${portraitDocContentHeight}px`,
        }"
      >
        <portrait-doc-main />
      </div>
    </div>

    <!-- 轮播屏 -->
    <div
      class="c-portrait-watch-layout__carousel-wrap"
      :style="{
        paddingTop: `${portraitDocWrapHeight}px`,
      }"
    >
      <portrait-watch-layout-carousel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitPlayerMain from '@/components/page-watch-common/player/player-main/portrait-player-main/portrait-player-main.vue';
import PortraitDocMain from '@/components/page-watch-common/doc/portrait-doc.vue';
import PortraitWatchLayoutCarousel from './portrait-watch-layout-carousel.vue';
import { useDocStore } from '@/store/use-doc-store';

const { portraitDocWrapHeight, portraitDocContentHeight } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);
</script>

<style lang="scss">
.c-portrait-watch-layout {
  position: relative;
  width: 100%;
  height: 100%;
}
.c-portrait-watch-layout__player-wrap {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
}

.c-portrait-watch-layout__doc-wrap {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 15;
  width: 100%;
  overflow: hidden;
}

.c-portrait-watch-layout__carousel-wrap {
  position: relative;
  z-index: 20;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
