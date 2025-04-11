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
        <transition name="c-mobile-order-center__fade">
          <iar-mobile-order-list
            v-if="!isShowDetail"
            ref="orderListRef"
            class="c-mobile-order-center__wrap__item"
            :order-sdk="orderSdk"
            :confirm-receipt="onConfirmReceipt"
            :confirm-pay="onOrderListConfirmPay"
            @confirm-receipt-success="onConfirmReceiptSuccess"
            @pay-success="onPaySuccess"
            @reach-detail="handleReachDetail"
          />
        </transition>
        <transition name="c-mobile-order-center__fade">
          <iar-mobile-order-detail
            v-if="isShowDetail"
            class="c-mobile-order-center__wrap__item c-mobile-order-center__detail"
            :order-sdk="orderSdk"
            :force-sync-pay-status="openDetailFromPaySuccess"
            :confirm-receipt="onConfirmReceipt"
            :confirm-pay="onConfirmPay"
            :order-no="currentDetailOrderNo"
            :show-payment-method="showPaymentMethod"
            :is-polling-api-after-confirm-pay="isPollingApiAfterConfirmPay"
            @confirm-receipt-success="onConfirmReceiptSuccess"
            @pay-success="onPaySuccess"
          />
        </transition>
        <div
          class="c-mobile-order-center__loading-container"
          v-if="loadingVisible"
        >
          <list-loading class="c-mobile-order-center__loading" />
        </div>
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
import { onMounted } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useOrderCenter } from './hooks/user-order-center';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

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
  orderSdk,
  showPaymentMethod,
  loadingVisible,
  onOrderListConfirmPay,
  isPollingApiAfterConfirmPay,
} = useOrderCenter();

onMounted(() => {
  const interactReceiveStore = useInteractReceiveStore();
  interactReceiveStore.getSupportPayProvider();
});
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
    @include iphone-x-pb(16px);
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

.c-mobile-order-center__loading-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.c-mobile-order-center__fade-enter-active,
.c-mobile-order-center__fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.c-mobile-order-center__fade-enter-from,
.c-mobile-order-center__fade-leave-to {
  opacity: 0;
}
</style>
