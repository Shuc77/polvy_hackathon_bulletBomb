<!-- @file 竖屏商品详情 -->
<template>
  <div>
    <dynamic-popup
      class="c-portrait-product-list__detail__popup"
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
        <div class="c-portrait-product-list__detail__popup__product-detail-btn">
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
import { ButtonSize, ButtonType } from '@/components/common-base/normal-button/types';
import DynamicPopup from '@/components/common-base/dynamic-popup/index.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import MobileProductDetail from '@/components/page-watch-common/product-detail/mobile-product-detail.vue';

import { useProduct } from './hooks/use-product';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const IarProductBtn = getIarComponent('ProductButton');

const { getWeixinSdk } = useWeixinSdk();

const { productDetailVisible } = storeDefinitionToRefs(useInteractReceiveStore);

const { productSdk, onWechatBuy } = useProduct();

const { getLinkParams } = useIarExternalLinkParams();

const { currentProduct } = useNewProductDetail();
</script>

<style lang="scss">
.c-portrait-product-list__detail__popup {
  .c-mobile-popup__content {
    border-radius: 16px 16px 0 0 !important;
  }
}

.c-portrait-product-list__detail__popup__product-detail-btn {
  padding: 12px 24px 34px;
}
</style>
