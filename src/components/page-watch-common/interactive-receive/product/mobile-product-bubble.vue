<!-- @file PC 端商品气泡 -->
<template>
  <iar-product-bubble
    class="c-mobile-product-bubble"
    :product-sdk="productSdk"
    :get-weixin-sdk="getWeixinSdk"
    :get-link-params="getLinkParams"
    :recruitment-enabled="recruitmentEnabled"
    :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
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
import { YN } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarProductBubble = getIarComponent('ProductBubble');

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useProductLinkParams();

const { productSdk, recruitmentEnabled } = useProduct();

const { trackProductPushItemView, trackProductPushItemClick } = useProductTrack();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
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
