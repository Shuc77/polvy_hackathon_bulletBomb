<!-- pc 端小卡片弹层 -->
<template>
  <div class="c-pc-product-small-card">
    <pc-product-small-card
      v-if="productTargetInited && paymentTargetInited && interactSetting.productEnabled"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';

const { interactSetting } = useInteractReceiveStore();

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
  pointer-events: initial;
}
</style>
