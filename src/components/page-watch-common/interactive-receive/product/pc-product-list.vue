<!-- @file PC 端商品列表 -->
<template>
  <div class="c-pc-product-list">
    <iar-pc-product-list
      ref="iarProductListRef"
      :product-sdk="productSdk"
      :get-link-params="getLinkParams"
      :desc-label="jobDescLabel"
      :recruitment-enabled="recruitmentEnabled"
      :hot-effect-enabled="productHotEffectEnabled"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      @click-good-desc="openGoodDetail"
      @total-change="onGoodTotalChange"
      @job-detail="onJobDetailEvent"
      @buy="onWechatBuy"
    />

    <!-- 旧版职位详情 -->
    <pc-dialog
      v-if="recruitmentEnabled"
      :title="jobDescLabel"
      :visible.sync="goodDetailVisible"
      @closed="closeGoodDetail"
    >
      <div class="c-pc-product-list__detail__main">
        <div class="c-pc-product-list__detail__desc">
          {{ goodDetail && goodDetail.productDesc }}
        </div>
        <div class="c-pc-product-list__detail__button">
          <iar-product-btn
            v-if="goodDetail"
            :product-sdk="productSdk"
            :good="goodDetail"
            :get-link-params="getLinkParams"
            :recruitment-enabled="recruitmentEnabled"
            :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
          >
            <template #default="{ buttonText, disabled }">
              <normal-button
                :text="buttonText"
                :disabled="disabled"
                :size="ButtonSize.Small"
              />
            </template>
          </iar-product-btn>
        </div>
      </div>
    </pc-dialog>
  </div>
</template>

<script setup lang="ts">
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useProductDetail } from './hooks/use-product-detail';
import { useProductList } from './hooks/use-product-list';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { YN } from '@polyv/live-watch-sdk';

const IarPcProductList = getIarComponent('PcProduct');
const IarProductBtn = getIarComponent('ProductButton');

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { productSdk, recruitmentEnabled, productHotEffectEnabled, jobDescLabel, onWechatBuy } = useProduct();

const { getLinkParams } = useProductLinkParams();

const { iarProductListRef, onGoodTotalChange } = useProductList();

const { goodDetail, goodDetailVisible, openGoodDetail, closeGoodDetail } = useProductDetail();
</script>

<style lang="scss">
.c-pc-product-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  .pws-iar-product-list-content {
    @include scrollbar;
  }
}

.c-pc-product-list__detail__main {
  position: relative;
  box-sizing: border-box;
  padding: 24px 40px 80px;
}
.c-pc-product-list__detail__desc {
  max-height: 428px;
  overflow: auto;
  font-size: 14px;
  line-height: 24px;
  color: #333333;
  white-space: pre-wrap;
}
.c-pc-product-list__detail__button {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
