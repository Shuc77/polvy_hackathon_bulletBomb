<template>
  <div class="c-portrait-product-bubble-wrap">
    <div
      v-if="productBubbleEnable"
      class="c-portrait-product-bubble"
    >
      <iar-product-bubble
        animation-type="normal"
        :product-sdk="productSdk"
        :get-weixin-sdk="getWeixinSdk"
        :get-link-params="getLinkParams"
        :hot-effect-tip-option="productHotEffectTips"
        :is-plv-webview="isPlvWebview"
        :get-plv-webview-bridge="getPlvWebviewBridge"
        :plv-webview-data-size="plvWebviewDataSize"
        :recruitment-enabled="recruitmentEnabled"
        :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
        :redirect-directly-enabled="interactSetting.outLinkProductRedirectEnabled"
        :hot-effect-enabled="productHotEffectEnabled"
        @job-detail="onJobDetailEvent"
        @click-cover="openProductDetail"
        @buy="onWechatBuy"
        @change="onChange"
      />
    </div>
    <iar-product-dialog
      v-if="productDialogEnable"
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
      :redirect-directly-enabled="interactSetting.outLinkProductRedirectEnabled"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
      @click-detail="openProductDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useProduct } from './hooks/use-product';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { YN } from '@polyv/live-watch-sdk';
import { useProductJobDetailEvent } from './hooks/use-product-job-detail';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProps } from '@/assets/utils/vue-utils/props-utils';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const props = defineProps({
  productBubbleEnable: {
    type: Boolean,
    default: true,
  },
  productDialogEnable: {
    type: Boolean,
    default: true,
  },
});
const { productBubbleEnable, productDialogEnable } = useProps(props);

const { onJobDetailEvent } = useProductJobDetailEvent();

const IarProductBubble = getIarComponent('ProductBubble');
const IarProductDialog = getIarComponent('ProductDialog');

const { getWeixinSdk } = useWeixinSdk();

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

const {
  productSdk,
  recruitmentEnabled,
  productHotEffectEnabled,
  productHotEffectTips,
  onWechatBuy,
  onChange,
} = useProduct();

const { getLinkParams } = useIarExternalLinkParams();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
const { openProductDetail } = useNewProductDetail();
</script>

<style lang="scss">
.c-portrait-product-bubble-wrap {
  width: 104px;
  margin-bottom: 16px;

  .plv-iar-product-bubble__link__content-cover {
    margin-top: 8px;
  }
}

.c-portrait-product-bubble {
  transform: translateX(-64px);
}
</style>
