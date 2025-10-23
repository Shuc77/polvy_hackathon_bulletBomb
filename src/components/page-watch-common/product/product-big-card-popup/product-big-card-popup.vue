<!-- 大卡片弹层 -->
<template>
  <product-big-card-popup
    v-if="productTargetInited && paymentTargetInited && interactSetting.liveProductEnabled"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    :before-click-interrupt="beforeClickInterrupt"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useProductUI } from '../hooks/use-product-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

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

const { toInterruptUserClick } = useInterruptUserClick();

function beforeClickInterrupt() {
  return toInterruptUserClick({ triggerSource: 'product-big-card-popup', ignoreSetNick: true });
}
</script>
