<!-- @file 竖屏商品列表弹层 -->
<template>
  <div class="c-portrait-product-list">
    <mobile-popup
      class="c-portrait-product-list__popup"
      :visible.sync="productListVisible"
      :theme="PopupTheme.PortraitLight"
      :content-percent-height="popupHeight"
      :show-header="false"
    >
      <!-- <template v-slot:title>
        <div class="c-portrait-product-list__title">
          <mobile-icon-product class="c-portrait-product-list__title__icon" />
          <span>
            {{ $lang('interact.product.list.title.quantity') }}：
            <span class="c-product__title__number pws-portrait-iar-product-title-number">
              {{ goodTotal }}
            </span>
          </span>
        </div>
      </template> -->

      <div class="c-portrait-product-list__wrap">
        <iar-mobile-product-list
          v-if="productListVisible"
          ref="iarProductListRef"
          :product-sdk="productSdk"
          :get-weixin-sdk="getWeixinSdk"
          :get-link-params="getLinkParams"
          :desc-label="jobDescLabel"
          :recruitment-enabled="recruitmentEnabled"
          :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
          :is-plv-webview="isPlvWebview"
          :get-plv-webview-bridge="getPlvWebviewBridge"
          :plv-webview-data-size="plvWebviewDataSize"
          :order-center-visible="isShowOrderCenter"
          @total-change="onGoodTotalChange"
          @click-good-desc="openGoodDetail"
          @click-plv-webview-jump="setProductListVisible(false)"
          @job-detail="onJobDetailEvent"
          @buy="onWechatBuy"
          @enter-order-center="onEnterOrderCenter"
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
import { YN } from '@polyv/live-watch-sdk';

import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useProductList } from './hooks/use-product-list';
import { useProductDetail } from './hooks/use-product-detail';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { isAndroid } from '@/assets/utils/browser';

const IarMobileProductList = getIarComponent('MobileProduct');
const IarProductBtn = getIarComponent('ProductButton');

const { getWeixinSdk } = useWeixinSdk();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
const { getPlvWebviewBridge } = useWebviewStore();

const { productSdk, recruitmentEnabled, jobDescLabel, onWechatBuy } = useProduct();

const { getLinkParams } = useProductLinkParams();

const {
  iarProductListRef,
  onGoodTotalChange,
  initProductList,
  isShowOrderCenter,
  onEnterOrderCenter,
} = useProductList({ autoInit: false });

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

/**
 * 设置弹窗高度，默认 | 商品搜索失焦 0.8 聚焦0.6
 */
const popupHeight = ref(0.8);

/** 兼容商品订单输入框安卓下显示不全问题 */
let originHeight = document.documentElement.clientHeight || document.body.clientHeight;

window.addEventListener('resize', function () {
  if (!isAndroid) return;

  const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
  if (originHeight < resizeHeight) {
    // Android 键盘收起后操作
    popupHeight.value = 0.8;
  } else {
    // Android 键盘弹起后操作
    popupHeight.value = 0.6;
  }

  originHeight = resizeHeight;
});

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

.c-portrait-product-list__popup .c-mobile-popup__content {
  overflow: hidden;
  border-radius: 16px 16px 0 0 !important;
}
</style>
