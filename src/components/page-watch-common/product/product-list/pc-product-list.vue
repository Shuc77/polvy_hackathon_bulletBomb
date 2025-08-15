<!-- PC 商品列表 -->
<template>
  <product-list
    v-if="productTargetInited && paymentTargetInited"
    ref="productListRef"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import { useProductUI } from '../hooks/use-product-ui';
import { useProductUILoader } from '../load-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductList = defineAsyncComponent(() => loadProductUI('product-list'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const productListRef = ref();

watch(
  productListRef,
  newVal => {
    if (newVal) {
      newVal.init();
    }
  },
  { immediate: true },
);
</script>
