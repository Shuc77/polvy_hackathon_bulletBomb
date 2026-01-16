<!-- PC 商品列表 -->
<template>
  <div class="c-pc-product-list">
    <product-list
      v-if="productTargetInited && paymentTargetInited"
      ref="productListRef"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      :before-click-interrupt="beforeClickInterrupt"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useProductUI } from '../hooks/use-product-ui';
import { useProductUILoader } from '../load-product-ui';

const { loadProductUI } = useProductUILoader();

const ProductList = defineAsyncComponent(() => loadProductUI('product-list'));

const { toInterruptUserClick } = useInterruptUserClick();

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

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'pc-product-list', ignoreSetNick: true });
}
</script>

<style lang="scss">
.c-pc-product-list {
  position: relative;
  height: 100%;
}
</style>
