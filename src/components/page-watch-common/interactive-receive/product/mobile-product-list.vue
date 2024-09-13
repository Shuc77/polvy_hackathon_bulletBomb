<!-- @file 移动端商品列表 -->
<template>
  <div class="c-mobile-product-list">
    <iar-mobile-product-list
      ref="iarProductListRef"
      :product-sdk="productSdk"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :desc-label="jobDescLabel"
      :recruitment-enabled="recruitmentEnabled"
      :hot-effect-enabled="productHotEffectEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      :order-center-visible="isShowOrderCenter"
      @click-good-desc="openGoodDetail"
      @total-change="onGoodTotalChange"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
      @enter-order-center="onEnterOrderCenter"
    />

    <!-- 旧版职位详情 -->
    <mobile-popup
      v-if="recruitmentEnabled"
      :title="jobDescLabel"
      :visible.sync="goodDetailVisible"
      @after-leave="closeGoodDetail"
    >
      <div class="c-mobile-product-list__detail__main">
        <div class="c-mobile-product-list__detail__desc">
          {{ goodDetail && goodDetail.productDesc }}
        </div>
        <div class="c-mobile-product-list__detail__button">
          <iar-product-btn
            v-if="goodDetail"
            :product-sdk="productSdk"
            :good="goodDetail"
            :get-weixin-sdk="getWeixinSdk"
            :get-link-params="getLinkParams"
            :recruitment-enabled="recruitmentEnabled"
            :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
          >
            <template #default="{ buttonText, disabled }">
              <normal-button
                :size="ButtonSize.Medium"
                block
                :text="buttonText"
                :disabled="disabled"
              />
            </template>
          </iar-product-btn>
        </div>
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useProductDetail } from './hooks/use-product-detail';
import { useProductList } from './hooks/use-product-list';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { YN } from '@polyv/live-watch-sdk';

const IarMobileProductList = getIarComponent('MobileProduct');
const IarProductBtn = getIarComponent('ProductButton');

const { getWeixinSdk } = useWeixinSdk();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { productSdk, recruitmentEnabled, jobDescLabel, onWechatBuy, productHotEffectEnabled } =
  useProduct();

const { getLinkParams } = useProductLinkParams();

const { iarProductListRef, onGoodTotalChange, isShowOrderCenter, onEnterOrderCenter } =
  useProductList();

const { goodDetail, goodDetailVisible, openGoodDetail, closeGoodDetail } = useProductDetail();
</script>

<style lang="scss">
.c-mobile-product-list {
  height: 100%;
  .pws-iar-product-list-content {
    @include scrollbar;
  }
}

.c-mobile-product-list__detail__main {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 24px;
}
.c-mobile-product-list__detail__desc {
  box-sizing: border-box;
  max-height: 100%;
  padding-bottom: 82px;
  overflow: auto;
  font-size: 14px;
  line-height: 24px;
  color: #333333;
  white-space: pre-wrap;
}
.c-mobile-product-list__detail__button {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 0 24px 34px;
  text-align: center;
}
</style>
