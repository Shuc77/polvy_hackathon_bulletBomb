<!-- 移动端小卡片弹层 -->
<template>
  <mobile-product-small-card
    v-if="
      productTargetInited &&
      paymentTargetInited &&
      interactReceiveStore.interactSetting.productEnabled
    "
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @not-support-direct-buy="handleNotSupportDirectBuy"
    @small-card-visible-change="onSmallCardVisibleChange"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useProductUILoader } from '../load-product-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProductUI } from '../hooks/use-product-ui';

const { loadProductUI } = useProductUILoader();

const MobileProductSmallCard = defineAsyncComponent(() => loadProductUI('small-card'));

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const interactReceiveStore = useInteractReceiveStore();
/**
 * 根据小卡片显示动态调整聊天室宽度
 */
function onSmallCardVisibleChange(visible: boolean) {
  interactReceiveStore.productBubbleVisible = visible;
}
</script>
