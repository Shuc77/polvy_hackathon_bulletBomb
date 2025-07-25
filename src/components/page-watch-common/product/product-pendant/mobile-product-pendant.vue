<!-- 移动端商品库挂件 -->
<template>
  <mobile-product-pendant
    v-if="productTargetInited"
    :product-target="getProductTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const MobileProductPendant = defineAsyncComponent(() => loadProductUI('mobile-product-pendant'));

const { productTargetInited, getProductTarget } = useProductUI();
</script>
