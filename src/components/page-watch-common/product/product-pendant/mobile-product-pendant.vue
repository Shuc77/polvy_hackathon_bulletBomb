<!-- 移动端商品库挂件 -->
<template>
  <mobile-product-pendant
    v-if="targetInited"
    :product-target="getProductTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { PolyvProduct } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const { targetInited, getIarTarget: getProductTarget } = useIarTarget<PolyvProduct>(() => {
  return watchCore.product.getProductTarget();
});

const { loadProductUI } = useProductUILoader();

const MobileProductPendant = defineAsyncComponent(() => loadProductUI('mobile-product-pendant'));
</script>
