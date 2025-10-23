<!-- 移动端商品库挂件 -->
<template>
  <mobile-product-pendant
    v-if="productTargetInited"
    :product-target="getProductTarget()"
    :before-click-interrupt="beforeClickInterrupt"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const { loadProductUI } = useProductUILoader();

const MobileProductPendant = defineAsyncComponent(() => loadProductUI('mobile-product-pendant'));

const { productTargetInited, getProductTarget } = useProductUI();

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'mobile-product-pendant', ignoreSetNick: true });
}
</script>
