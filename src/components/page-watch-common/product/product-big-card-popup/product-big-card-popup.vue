<!-- 大卡片弹层 -->
<template>
  <product-big-card-popup
    v-if="productTargetInited && paymentTargetInited && interactSetting.productEnabled"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { interactSetting } = useInteractReceiveStore();

const { loadProductUI } = useProductUILoader();

const ProductBigCardPopup = defineAsyncComponent(() => loadProductUI('big-card-popup'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();
</script>
