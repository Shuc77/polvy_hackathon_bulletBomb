<!-- 商品列表弹层 -->
<template>
  <product-list-popup
    v-if="productTargetInited && paymentTargetInited"
    :product-target="getProductTarget()"
    :payment-target="getPaymentTarget()"
    :product-config="productUIConfig"
    @not-support-direct-buy="handleNotSupportDirectBuy"
  />
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { PolyvProduct, PolyvPayment } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';

const { getWatchCore, getEmitter } = useGlobalInject();

const { getLinkParams } = useIarExternalLinkParams();

const watchCore = getWatchCore();

const productUIConfig = ref({
  getLinkParams,
});

const { targetInited: productTargetInited, getIarTarget: getProductTarget } =
  useIarTarget<PolyvProduct>(() => {
    return watchCore.product.getProductTarget();
  });

const { targetInited: paymentTargetInited, getIarTarget: getPaymentTarget } =
  useIarTarget<PolyvPayment>(() => {
    return watchCore.product.getPaymentTarget();
  });

const { loadProductUI } = useProductUILoader();

const ProductListPopup = defineAsyncComponent(() => loadProductUI('product-list-popup'));

/**
 * 不支持直接购买，引导扫码进入移动端
 */
function handleNotSupportDirectBuy() {
  getEmitter().emit(appEvents.global.OpenQrCodeShareDialog);
}
</script>
