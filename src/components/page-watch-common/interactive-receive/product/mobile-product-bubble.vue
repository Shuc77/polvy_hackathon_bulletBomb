<!-- @file PC 端商品气泡 -->
<template>
  <div>
    <div
      v-if="productBubbleEnable"
      class="c-mobile-product-bubble-wrap"
    >
      <iar-product-bubble
        class="c-mobile-product-bubble"
        animation-type="normal"
        :product-sdk="productSdk"
        :get-weixin-sdk="getWeixinSdk"
        :get-link-params="getLinkParams"
        :hot-effect-tip-option="productHotEffectTips"
        :hot-effect-enabled="productHotEffectEnabled"
        :recruitment-enabled="recruitmentEnabled"
        :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
        @job-detail="onJobDetailEvent"
        @buy="onWechatBuy"
        @change="onChange"
      />
    </div>
    <iar-product-dialog
      v-if="productDialogEnable"
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
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
import { useProps } from '@/assets/utils/vue-utils/props-utils';

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
const IarProductBubble = getIarComponent('ProductBubble');
const IarProductDialog = getIarComponent('ProductDialog');

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useProductLinkParams();

const {
  productSdk,
  recruitmentEnabled,
  productHotEffectTips,
  productHotEffectEnabled,
  onWechatBuy,
  onChange,
} = useProduct();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-mobile-product-bubble-wrap {
  width: 104px;
  transform: translateX(-64px);
}
</style>
