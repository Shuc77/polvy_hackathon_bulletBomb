<!-- @file PC 端商品气泡 -->
<template>
  <div>
    <iar-product-bubble
      class="c-mobile-product-bubble"
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :hot-effect-tip-option="productHotEffectTips"
      :hot-effect-enabled="productHotEffectEnabled"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
    />
    <iar-product-dialog
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
const IarProductBubble = getIarComponent('ProductBubble');
const IarProductDialog = getIarComponent('ProductDialog');

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useProductLinkParams();

const { productSdk, recruitmentEnabled, productHotEffectTips, productHotEffectEnabled } =
  useProduct();

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
