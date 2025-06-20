<!-- PC 商品详情弹层 -->
<template>
  <div
    v-if="interactSetting.productSuspendOnPlayerEnabled"
    ref="productDetailPopupRef"
    class="c-pc-product-detail-popup"
  >
    <product-detail-popup
      v-if="productTargetInited && paymentTargetInited"
      :product-target="getProductTarget()"
      :payment-target="getPaymentTarget()"
      :product-config="productUIConfig"
      :popup-config="popupConfig"
      @play="toPause"
      @pause="toPlay"
      @not-support-direct-buy="handleNotSupportDirectBuy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref, defineAsyncComponent } from 'vue';
import { PolyvProduct, PolyvPayment } from '@polyv/live-watch-sdk';
import { useProductUILoader } from '../load-product-ui';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';

const { getWatchCore, getEmitter } = useGlobalInject();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { getLinkParams } = useIarExternalLinkParams();

const { toPlay, toPause } = usePlayerAction();

const watchCore = getWatchCore();

const productUIConfig = ref({
  getLinkParams,
});

const productDetailPopupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(productDetailPopupRef),
    showModal: false,
  };
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

const ProductDetailPopup = defineAsyncComponent(() => loadProductUI('product-detail-popup'));

/**
 * 不支持直接购买，引导扫码进入移动端
 */
function handleNotSupportDirectBuy() {
  getEmitter().emit(appEvents.global.OpenQrCodeShareDialog);
}
</script>
