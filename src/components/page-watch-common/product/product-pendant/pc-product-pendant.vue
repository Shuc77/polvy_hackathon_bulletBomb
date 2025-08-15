<!-- PC 商品库挂件 -->
<template>
  <div class="c-pc-product-pendant">
    <pc-product-pendant
      v-if="targetInited"
      :product-target="getProductTarget()"
    />
  </div>
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

const PcProductPendant = defineAsyncComponent(() => loadProductUI('pc-product-pendant'));
</script>

<style lang="scss">
.c-pc-product-pendant {
  .plv-product-pc-pendant {
    pointer-events: initial;
  }

  .plv-product-pc-pendant--collapsed {
    transform: translateX(16px);
  }
}
</style>
