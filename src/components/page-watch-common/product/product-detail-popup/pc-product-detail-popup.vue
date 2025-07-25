<!-- PC 商品详情弹层 -->
<template>
  <div
    v-if="interactSetting.productSuspendOnPlayerEnabled"
    ref="productDetailPopupRef"
    class="c-pc-product-detail-popup"
  >
    <product-detail-popup
      ref="productDetailInnerPopupRef"
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
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useProductUILoader } from '../load-product-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useProductUI } from '../hooks/use-product-ui';

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { loadProductUI } = useProductUILoader();

const ProductDetailPopup = defineAsyncComponent(() => loadProductUI('product-detail-popup'));

const { toPlay, toPause } = usePlayerAction();

const productDetailPopupRef = ref<HTMLElement>();

const popupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(productDetailPopupRef),
    showModal: false,
  };
});

const {
  productUIConfig,
  productTargetInited,
  paymentTargetInited,

  getProductTarget,
  getPaymentTarget,
  handleNotSupportDirectBuy,
} = useProductUI();

const productDetailInnerPopupRef = ref();
useEventBusListener(appEvents.product.OpenProductDetailPopup, (productId: number) => {
  productDetailInnerPopupRef.value?.open(productId);
});
</script>
