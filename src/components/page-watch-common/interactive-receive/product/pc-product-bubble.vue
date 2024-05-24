<!-- @file PC 端商品气泡 -->
<template>
  <div class="c-pc-product-bubble">
    <iar-product-bubble
      :product-sdk="productSdk"
      :hot-effect-tip-option="productHotEffectTips"
      :hot-effect-enabled="productHotEffectEnabled"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
    />
    <iar-product-dialog
      :product-sdk="productSdk"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';

const IarProductBubble = getIarComponent('ProductBubble');
const IarProductDialog = getIarComponent('ProductDialog');

const { productSdk, recruitmentEnabled, productHotEffectTips, productHotEffectEnabled } =
  useProduct();

const { getLinkParams } = useProductLinkParams();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-pc-product-bubble {
  position: absolute;
  top: 16px;
  right: 0;
  left: 0;
  z-index: 50;
  padding-left: 8px;
  overflow: hidden;
}
</style>
