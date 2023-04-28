<template>
  <div class="c-portrait-product-bubble">
    <iar-product-bubble
      animation-type="scale"
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :is-plv-webview="isPlvWebview"
      :get-plv-webview-bridge="getPlvWebviewBridge"
      :plv-webview-data-size="plvWebviewDataSize"
      @product-push="trackProductPushItemView"
      @click-buy="trackProductPushItemClick"
      @job-detail="onJobDetailEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useProduct, useProductLinkParams, useProductTrack } from './hooks/use-product';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarProductBubble = getIarComponent('ProductBubble');

const { getWeixinSdk } = useWeixinSdk();

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

const { productSdk } = useProduct();

const { getLinkParams } = useProductLinkParams();

const { trackProductPushItemView, trackProductPushItemClick } = useProductTrack();
</script>

<style lang="scss">
.c-portrait-product-bubble {
  position: absolute;
  top: -8px;
  left: 50%;
  z-index: 10;
  width: 12px;
  height: 8px;
  transform: translateX(-50%);
}
</style>
