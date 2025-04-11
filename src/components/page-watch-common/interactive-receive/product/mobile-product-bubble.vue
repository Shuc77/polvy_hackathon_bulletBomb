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
        :redirect-directly-enabled="interactSetting.outLinkProductRedirectEnabled"
        @click-detail="openProductDetail"
        :is-plv-webview="isPlvWebview"
        :get-plv-webview-bridge="getPlvWebviewBridge"
        :plv-webview-data-size="plvWebviewDataSize"
        @job-detail="onJobDetailEvent"
        @buy="onWechatBuy"
        @change="onChange"
        @click-cover="openProductDetail"
      />
    </div>
    <iar-product-dialog
      v-if="productDialogEnable"
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :recruitment-enabled="recruitmentEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      :redirect-directly-enabled="interactSetting.outLinkProductRedirectEnabled"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
      @click-detail="openProductDetail"
    />

    <dynamic-popup
      v-if="!productDialogEnable"
      class="c-mobile-product-list__detail__popup"
      :visible.sync="productDetailVisible"
      :show-header="false"
      :content-percent-height="0.8"
      :fill-body-section="true"
      :ignore-content-max-height="true"
      :max-height="0.95"
      :init-height="0.75"
    >
      <mobile-product-detail></mobile-product-detail>

      <template #footer>
        <div class="c-mobile-product-list__normal-detail-btn">
          <iar-product-btn
            v-if="currentProduct"
            :product-sdk="productSdk"
            :good="currentProduct"
            :get-weixin-sdk="getWeixinSdk"
            :get-link-params="getLinkParams"
            @buy="onWechatBuy"
          >
            <template #default="{ buttonText, disabled }">
              <normal-button
                :size="ButtonSize.Medium"
                :type="ButtonType.Aggravate"
                block
                :text="buttonText"
                :disabled="disabled"
              />
            </template>
          </iar-product-btn>
        </div>
      </template>
    </dynamic-popup>
  </div>
</template>

<script setup lang="ts">
import DynamicPopup from '@/components/common-base/dynamic-popup/index.vue';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import MobileProductDetail from '@/components/page-watch-common/product-detail/mobile-product-detail.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { useProduct } from './hooks/use-product';
import { useProductJobDetailEvent } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { useProps } from '@/assets/utils/vue-utils/props-utils';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import { useWebviewStore } from '@/store/use-webview-store';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const IarProductBtn = getIarComponent('ProductButton');

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

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

const { getLinkParams } = useIarExternalLinkParams();

const {
  productSdk,
  recruitmentEnabled,
  productHotEffectTips,
  productHotEffectEnabled,
  onWechatBuy,
  onChange,
} = useProduct();

const { interactSetting, productDetailVisible } = storeDefinitionToRefs(useInteractReceiveStore);
const { openProductDetail, currentProduct } = useNewProductDetail();
</script>

<style lang="scss">
.c-mobile-product-bubble-wrap {
  width: 104px;
  transform: translateX(-64px);
}

.c-mobile-product-list__detail__popup .c-mobile-popup__content {
  overflow: hidden;
  border-radius: 16px 16px 0 0 !important;
}
</style>
