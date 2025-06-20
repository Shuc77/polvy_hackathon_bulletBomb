<!-- 订单确认页弹层 -->
<template>
  <product-order-popup
    v-if="orderTargetInited && paymentTargetInited && addressTargetInited"
    ref="productOrderPopupRef"
    :order-target="getOrderTarget()"
    :payment-target="getPaymentTarget()"
    :address-target="getAddressTarget()"
  />
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { PolyvOrder, PolyvPayment, PolyvAddress, NormalProductData } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import type { NormalProductGoodData } from '@/components/page-watch-common/interactive-receive/product/types/product-types';
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

const { targetInited: addressTargetInited, getIarTarget: getAddressTarget } =
  useIarTarget<PolyvAddress>(() => {
    return watchCore.product.getAddressTarget();
  });

const { loadProductUI } = useProductUILoader();

const ProductOrderPopup = defineAsyncComponent(() => loadProductUI('order-popup'));

const productOrderPopupRef = ref();

useEventBusListener(appEvents.interaction.OpenOrderPopup, showOrderPopup);

// TODO: 待重构大小卡片后，修改此函数
function showOrderPopup(products: NormalProductGoodData[]) {
  const productList = products.map(product => {
    return {
      productId: product.productId,
      name: product.name,
      cover: product.cover,
      realPrice: product.realPrice,
      deliveryType: product.deliveryType,
      customerServiceContact: product.customerServiceContact,
      customerServiceType: product.customerServiceType,
      description: product.productDesc,
      featureTags: Array.isArray(product.features)
        ? product.features
        : JSON.parse(product.features || '[]'),
    } as NormalProductData;
  });
  productOrderPopupRef.value?.setupProductOrderPopup(productList);
}
</script>
