<template>
  <pc-side-popup
    v-if="productDetailVisible"
    :visible.sync="productDetailVisible"
    :open-event="appEvents.interaction.OpenProductDetail"
  >
    <div class="c-pc-product-detail">
      <iar-product-detail
        class="c-pc-product-detail__iar-product-detail"
        :product-info="productDetailInfo"
        :cover-config="productDetailCoverConfig"
        @play="handleProductDetailVideoPlay"
        @pause="handleProductDetailVideoPause"
        :lang="currentLang"
      />

      <div class="c-pc-product-detail__footer">
        <iar-product-btn
          v-if="currentProduct"
          :product-sdk="productSdk"
          :good="currentProduct"
          :get-weixin-sdk="getWeixinSdk"
          :get-link-params="getLinkParams"
          :recruitment-enabled="recruitmentEnabled"
          :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
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
    </div>
  </pc-side-popup>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import PcSidePopup from '@/components/common-base/side-popup/pc-side-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import { useProduct } from '@/components/page-watch-common/interactive-receive/product/hooks/use-product';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { YN } from '@polyv/live-watch-sdk';
import { useIarExternalLinkParams } from '../interactive-receive/use-iar-external-link-params';

const { getWeixinSdk } = useWeixinSdk();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { productSdk, recruitmentEnabled, onWechatBuy } = useProduct();

const { getLinkParams } = useIarExternalLinkParams();

const IarProductDetail = getIarComponent('ProductDetail');
const IarProductBtn = getIarComponent('ProductButton');
const {
  productDetailInfo,
  productDetailCoverConfig,
  currentProduct,
  productDetailVisible,
  handleProductDetailVideoPlay,
  handleProductDetailVideoPause,
  currentLang,
} = useNewProductDetail();
</script>

<style lang="scss">
@import './assets/scss/product-detail.scss';

.c-pc-product-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 8px;
}

.c-pc-product-detail__iar-product-detail {
  flex: 1;
  overflow: auto;
  border-radius: 8px;
}

.c-pc-product-detail__footer {
  padding: 8px 28px;

  .c-normal-button {
    height: 44px;
  }
}
</style>
