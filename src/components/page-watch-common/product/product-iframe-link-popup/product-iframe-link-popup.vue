<!-- 用于承载商品外链的 iframe 弹层 -->
<template>
  <product-iframe-link-popup v-if="targetInited" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { PolyvProduct } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const { targetInited } = useIarTarget<PolyvProduct>(() => {
  return watchCore.product.getProductTarget();
});

const { loadProductUI } = useProductUILoader();

const ProductIframeLinkPopup = defineAsyncComponent(() =>
  loadProductUI('product-iframe-link-popup'),
);
</script>
