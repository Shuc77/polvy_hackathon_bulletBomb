<!-- @file PC 端商品气泡 -->
<template>
  <iar-product-bubble
    class="c-mobile-product-bubble"
    :product-sdk="productSdk"
    :get-weixin-sdk="getWeixinSdk"
    :get-link-params="getLinkParams"
    :recruitment-enabled="recruitmentEnabled"
    @product-push="trackProductPushItemView"
    @click-buy="trackProductPushItemClick"
    @job-detail="onJobDetailEvent"
  />
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useProduct, useProductLinkParams, useProductTrack } from './hooks/use-product';
import { onJobDetailEvent } from './hooks/use-product-job-detail';

const IarProductBubble = getIarComponent('ProductBubble');

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useProductLinkParams();

const { productSdk, recruitmentEnabled } = useProduct();

const { trackProductPushItemView, trackProductPushItemClick } = useProductTrack();
</script>

<style lang="scss">
.c-mobile-product-bubble {
  position: absolute;
  top: 20px;
  right: 0;
  left: 8px;
  z-index: 400;
}
</style>
