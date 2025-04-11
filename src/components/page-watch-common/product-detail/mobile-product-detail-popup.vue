<template>
  <mobile-popup
    :visible.sync="productDetailVisible"
    :show-header="false"
    :content-percent-height="0.8"
    :fill-body-section="true"
    :ignore-content-max-height="true"
    class="c-mobile-product-list__detail__popup"
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
  </mobile-popup>
</template>

<script setup lang="ts">
import MobileProductDetail from './mobile-product-detail.vue';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import { useProduct } from '@/components/page-watch-common/interactive-receive/product/hooks/use-product';
import { useIarExternalLinkParams } from '../interactive-receive/use-iar-external-link-params';

const IarProductBtn = getIarComponent('ProductButton');

const { productDetailVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { productSdk, onWechatBuy } = useProduct();

const { currentProduct } = useNewProductDetail();

const { getWeixinSdk } = useWeixinSdk();

// eslint-disable-next-line no-undef
const { getLinkParams } = useIarExternalLinkParams();
</script>

<style lang="scss">
.c-mobile-product-list__detail__popup .c-mobile-popup__content {
  overflow: hidden;
  border-radius: 16px 16px 0 0 !important;
}
</style>
