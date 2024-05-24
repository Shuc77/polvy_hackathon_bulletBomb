<!-- @file 竖屏商品列表弹层 -->
<template>
  <div class="c-portrait-product-list">
    <mobile-popup
      :visible.sync="productListVisible"
      :theme="PopupTheme.Portrait"
      content-percent-height
    >
      <template v-slot:title>
        <div class="c-portrait-product-list__title">
          <mobile-icon-product class="c-portrait-product-list__title__icon" />
          <span>
            {{ $lang('interact.product.list.title.quantity') }}：
            <span class="c-product__title__number pws-portrait-iar-product-title-number">
              {{ goodTotal }}
            </span>
          </span>
        </div>
      </template>

      <div class="c-portrait-product-list__wrap">
        <iar-mobile-product-list
          v-if="renderProductList"
          ref="iarProductListRef"
          :product-sdk="productSdk"
          :get-weixin-sdk="getWeixinSdk"
          :get-link-params="getLinkParams"
          :total-visible="false"
          :desc-label="jobDescLabel"
          :recruitment-enabled="recruitmentEnabled"
          :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
          :is-plv-webview="isPlvWebview"
          :get-plv-webview-bridge="getPlvWebviewBridge"
          :plv-webview-data-size="plvWebviewDataSize"
          @total-change="onGoodTotalChange"
          @click-good-desc="openGoodDetail"
          @click-plv-webview-jump="setProductListVisible(false)"
          @job-detail="onJobDetailEvent"
        />
      </div>
    </mobile-popup>

    <!-- 旧版职位详情 -->
    <mobile-popup
      v-if="recruitmentEnabled"
      :title="jobDescLabel"
      :visible.sync="goodDetailVisible"
      :theme="PopupTheme.FollowPageSkin"
      :mask-opacity="0"
      backable
      content-percent-height
      @click-back="closeGoodDetail"
      @close="closeGoodDetail"
    >
      <div class="c-portrait-product-list__detail__main">
        <div class="c-portrait-product-list__detail__desc">
          {{ goodDetail && goodDetail.productDesc }}
        </div>
        <div class="c-portrait-product-list__detail__button">
          <iar-product-btn
            v-if="goodDetail"
            :product-sdk="productSdk"
            :good="goodDetail"
            :get-weixin-sdk="getWeixinSdk"
            :get-link-params="getLinkParams"
            :recruitment-enabled="recruitmentEnabled"
            :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
            :is-plv-webview="isPlvWebview"
            :get-plv-webview-bridge="getPlvWebviewBridge"
            :plv-webview-data-size="plvWebviewDataSize"
            @click-plv-webview-jump="setProductListVisible(false)"
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
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { ref, onBeforeMount, onBeforeUnmount } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { appEvents, eventBus } from '@/app/app-events';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { onJobDetailEvent } from './hooks/use-product-job-detail';
import { MobileIconProduct } from '@/components/component-icons/mobile/map';
import { YN } from '@polyv/live-watch-sdk';

import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useProductList } from './hooks/use-product-list';
import { useProductDetail } from './hooks/use-product-detail';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileProductList = getIarComponent('MobileProduct');
const IarProductBtn = getIarComponent('ProductButton');

const { getWeixinSdk } = useWeixinSdk();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

const { productSdk, recruitmentEnabled, jobDescLabel } = useProduct();

const { getLinkParams } = useProductLinkParams();

const { iarProductListRef, renderProductList, goodTotal, onGoodTotalChange, initProductList } =
  useProductList();

const { goodDetail, goodDetailVisible, openGoodDetail, closeGoodDetail } = useProductDetail();

/** 商品列表弹窗是否显示 */
const productListVisible = ref(false);

/** 设置商品列表弹窗显示状态 */
const setProductListVisible = (visible = true) => {
  productListVisible.value = visible;
  if (visible) {
    initProductList();
  }
};

onBeforeMount(() => {
  eventBus.$on(appEvents.interaction.OpenPortraitProductList, setProductListVisible);
});

onBeforeUnmount(() => {
  eventBus.$off(appEvents.interaction.OpenPortraitProductList, setProductListVisible);
});
</script>

<style lang="scss">
.c-portrait-product-list__title {
  display: flex;
  align-items: center;
  font-size: 12px;

  .c-portrait-product-list__title__icon {
    display: flex;
    margin-right: 5px;
    font-size: 12px !important;
  }

  .c-product__title__number {
    color: #ffa611;
  }
}

.c-portrait-product-list__wrap {
  height: 100%;
  overflow: hidden;
}

.c-portrait-product-list__detail__main {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 8px 24px 98px;
}
.c-portrait-product-list__detail__desc {
  box-sizing: border-box;
  max-height: 100%;
  overflow: auto;
  font-size: 14px;
  line-height: 24px;
  color: #fff;
  white-space: pre-wrap;
}
.c-portrait-product-list__detail__button {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 0 24px 34px;
  text-align: center;
}
</style>
