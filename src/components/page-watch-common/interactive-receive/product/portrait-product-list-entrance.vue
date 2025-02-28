<!-- @file 竖屏商品库入口 -->
<template>
  <div class="c-portrait-product-list-entrance">
    <!-- 原先的 if 条件是写在组件外层，但这会导致商品库关闭后，下面的 portrait-product-bubble 大卡片组件无法显示出来 -->
    <template v-if="interactSetting.productEnabled">
      <div
        v-if="!recruitmentEnabled"
        ref="containerRef"
        class="c-portrait-product-list-entrance__svga"
        @click="onClickEntrance"
      ></div>
      <div
        v-else
        class="c-portrait-product-list-entrance__btn"
        @click="onClickEntrance"
      ></div>
    </template>

    <portrait-product-bubble :product-bubble-enable="false" />
  </div>
</template>

<script setup lang="ts">
import PortraitProductBubble from './portrait-product-bubble.vue';
import { useSvgaAnimation } from '@/hooks/animation/use-svga-animation';
import shopIconUrl from './imgs/icon-shop-car.svga';
import { ref, unref } from 'vue';
import { useProduct } from './hooks/use-product';
import { appEvents } from '@/app/app-events';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
const { trackUserClickProductList } = useWatchEventTrack();

const containerRef = ref<HTMLDivElement>();

const { recruitmentEnabled } = useProduct();

if (!unref(recruitmentEnabled)) {
  useSvgaAnimation({
    containerRef,
    svgaUrl: shopIconUrl,
  });
}

const { getEmitter } = useGlobalInject();

function onClickEntrance() {
  trackUserClickProductList();
  getEmitter().emit(appEvents.interaction.OpenPortraitProductList, true);
}
</script>

<style lang="scss">
.c-portrait-product-list-entrance {
  position: relative;
}

.c-portrait-product-list-entrance__svga {
  position: absolute;
  bottom: -3px;
  left: 50%;
  z-index: 12;
  width: 50px;
  height: 56px;
  overflow: hidden;
  transform: translateX(-50%);
}

.c-portrait-product-list-entrance__btn {
  width: 100%;
  height: 100%;
  background-image: url(./imgs/icon-job.png);
  background-size: 100% 100%;
}
</style>
