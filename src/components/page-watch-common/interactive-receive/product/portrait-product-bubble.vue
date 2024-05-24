<template>
  <div>
    <div class="c-portrait-product-bubble">
      <iar-product-bubble
        animation-type="scale"
        :product-sdk="productSdk"
        :get-weixin-sdk="getWeixinSdk"
        :get-link-params="getLinkParams"
        :is-plv-webview="isPlvWebview"
        :get-plv-webview-bridge="getPlvWebviewBridge"
        :plv-webview-data-size="plvWebviewDataSize"
        :recruitment-enabled="recruitmentEnabled"
        :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
        @job-detail="onJobDetailEvent"
      />
    </div>
    <iar-product-dialog
      :product-sdk="productSdk"
      :hot-effect-tip-option="productHotEffectTips"
      :hot-effect-enabled="productHotEffectEnabled"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :is-plv-webview="isPlvWebview"
      :get-plv-webview-bridge="getPlvWebviewBridge"
      :plv-webview-data-size="plvWebviewDataSize"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { YN } from '@polyv/live-watch-sdk';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarProductBubble = getIarComponent('ProductBubble');
const IarProductDialog = getIarComponent('ProductDialog');

const { getWeixinSdk } = useWeixinSdk();

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

const { productSdk, recruitmentEnabled, productHotEffectEnabled, productHotEffectTips } =
  useProduct();

const { getLinkParams } = useProductLinkParams();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
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
