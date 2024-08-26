<!-- @file PC 端商品气泡 -->
<template>
  <div class="c-pc-product-bubble">
    <div
      v-if="productBubbleEnable"
      class="c-pc-product-bubble-warp"
    >
      <div>
        <iar-product-bubble
          animation-type="normal"
          :product-sdk="productSdk"
          :hot-effect-tip-option="productHotEffectTips"
          :hot-effect-enabled="productHotEffectEnabled"
          :get-link-params="getLinkParams"
          :recruitment-enabled="recruitmentEnabled"
          :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
          @job-detail="onJobDetailEvent"
          @buy="onWechatBuy"
          @change="onChange"
        />
      </div>
    </div>
    <iar-product-dialog
      class="c-pc-product-bubble-dialog"
      v-if="productDialogEnable"
      :product-sdk="productSdk"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
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

const {
  productSdk,
  recruitmentEnabled,
  productHotEffectTips,
  productHotEffectEnabled,
  onWechatBuy,
  onChange,
} = useProduct();

const { getLinkParams } = useProductLinkParams();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
.c-pc-product-bubble,
.c-pc-product-bubble-warp {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-pc-product-bubble-warp {
  overflow: hidden;
  > div {
    position: absolute;
    bottom: 70px;
    left: 100%;
    width: 104px;
    transform: translateX(-120px);
  }
}

.c-pc-product-bubble-dialog {
  pointer-events: all;
}
</style>
