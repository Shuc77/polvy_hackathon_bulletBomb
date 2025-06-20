<!-- 订单列表弹层 -->
<template>
  <product-order-list-popup
    v-if="orderTargetInited && paymentTargetInited"
    :order-target="getOrderTarget()"
    :payment-target="getPaymentTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { PolyvOrder, PolyvPayment } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const { targetInited: orderTargetInited, getIarTarget: getOrderTarget } = useIarTarget<PolyvOrder>(
  () => {
    return watchCore.product.getOrderTarget();
  },
);

const { targetInited: paymentTargetInited, getIarTarget: getPaymentTarget } =
  useIarTarget<PolyvPayment>(() => {
    return watchCore.product.getPaymentTarget();
  });

const { loadProductUI } = useProductUILoader();

const ProductOrderListPopup = defineAsyncComponent(() => loadProductUI('order-list-popup'));
</script>
