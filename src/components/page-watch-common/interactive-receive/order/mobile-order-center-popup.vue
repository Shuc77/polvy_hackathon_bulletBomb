<template>
  <div class="c-mobile-order-center">
    <mobile-popup
      class="c-mobile-order-center__popup"
      :visible.sync="visible"
      :title="popupTitle"
      :closable="false"
      fill-body-section
      force-show-body-scrollbar
      backable
      @click-back="onPopupBack"
    >
      <div class="c-mobile-order-center__wrap">
        <iar-mobile-order-list
          v-show="!isShowDetail"
          ref="orderListRef"
          class="c-mobile-order-center__wrap__item"
          :order-sdk="orderSdk"
          :confirm-receipt="onConfirmReceipt"
          :confirm-pay="onConfirmPay"
          @confirm-receipt-success="onConfirmReceiptSuccess"
          @pay-success="onPaySuccess"
          @reach-detail="handleReachDetail"
        />
        <iar-mobile-order-detail
          v-if="isShowDetail"
          class="c-mobile-order-center__wrap__item c-mobile-order-center__detail"
          :order-sdk="orderSdk"
          :force-sync-pay-status="openDetailFromPaySuccess"
          :confirm-receipt="onConfirmReceipt"
          :confirm-pay="onConfirmPay"
          :order-no="currentDetailOrderNo"
          @confirm-receipt-success="onConfirmReceiptSuccess"
          @pay-success="onPaySuccess"
        />
      </div>
    </mobile-popup>

    <!-- 确认收货提示弹层 -->
    <mobile-message-box
      ref="receiptTipsRef"
      content-center
      :content="$lang('order.confirmReceipt')"
      :confirm-button-text="$lang('base.confirm')"
      :cancel-button-text="$lang('base.cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useOrder } from './hooks/use-order';
import { useOrderCenter } from './hooks/user-order-center';

const IarMobileOrderList = getIarComponent('MobileOrderList');
const IarMobileOrderDetail = getIarComponent('MobileOrderDetail');

const {
  visible,
  onConfirmReceipt,
  onConfirmPay,
  MobileMessageBox,
  receiptTipsRef,
  handleReachDetail,
  isShowDetail,
  currentDetailOrderNo,
  popupTitle,
  onPopupBack,
  onConfirmReceiptSuccess,
  orderListRef,
  onPaySuccess,
  openDetailFromPaySuccess,
} = useOrderCenter();

const { orderSdk } = useOrder();
</script>

<style lang="scss">
.c-mobile-order-center__popup {
  .c-mobile-popup__content {
    background: #f7f8fa;
  }

  .c-mobile-popup__header {
    border-bottom: unset;
  }

  .plv-iar-order-detail__bottom {
    @include iphone-x-pb(24px);
  }
}

.c-mobile-order-center__wrap {
  position: relative;
  height: 100%;

  .c-mobile-order-center__wrap__item {
    height: 100%;
  }

  .c-mobile-order-center__detail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
