<!-- pc 端小卡片弹层 -->
<template>
  <div class="c-pc-product-small-card">
    <pc-product-small-card
      v-if="productTargetInited && paymentTargetInited"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const PcProductSmallCard = defineAsyncComponent(() => loadProductUI('small-card'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();
</script>

<style lang="scss">
.c-pc-product-small-card {
  position: absolute;
  right: 8px;
  bottom: 20%;
  pointer-events: initial;
}
</style>
