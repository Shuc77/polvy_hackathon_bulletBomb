<!-- @file 移动端订单弹层 -->
<template>
  <div>
    <mobile-popup
      class="c-mobile-order-popup"
      :fill-body-section="isFillBodySection"
      :title="orderPopupTitle"
      :visible.sync="visible"
      :update-on-resize="true"
      :content-style="{ background: '#F7F8FA' }"
      force-show-body-scrollbar
      backable
      :closable="false"
      @click-back="onPopupBack"
      @after-leave="handleAfterLeave"
      @after-enter="handleAfterEnter"
    >
      <div class="c-mobile-order-container">
        <iar-mobile-order
          v-if="currentPopupRoute === OrderPopupRoute.Order && orderSdk && showOrderComp"
          :products="products"
          :submit-disabled="submitting"
          :address="address"
          :order-sdk="orderSdk"
          :address-management-sdk="addressManagementSdk"
          :show-payment-method="showPaymentMethod"
          @click-address="navigateToAddressList"
          @submit="onSubmitOrder"
          @change-payment-method="onChangePaymentMethod"
        />
        <iar-mobile-address-list
          v-else-if="currentPopupRoute === OrderPopupRoute.AddressList"
          :address-management-sdk="addressManagementSdk"
          :active-address-key.sync="address.id"
          @edit="navigateToAddressEdit"
          @add="navigateToAddressEdit"
          @select="onSelectAddress"
        />
        <iar-mobile-address-edit
          v-else-if="currentPopupRoute === OrderPopupRoute.AddressEdit"
          ref="addressEditRef"
          :address-management-sdk="addressManagementSdk"
          :save-type="addressSaveType"
          @click-area="onAreaSelectorClick"
          @save="saveAddressCb"
        />

        <div
          class="c-mobile-order-popup__loading-container"
          v-if="loadingVisible"
        >
          <list-loading class="c-mobile-order-popup__loading" />
        </div>
      </div>
    </mobile-popup>
    <area-picker
      :visible.sync="areaPickVisible"
      @change="onAreaChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import AreaPicker from '@/components/common-base/area-picker/area-picker.vue';
import ListLoading from '@/components/common-base/list-loading/list-loading.vue';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useOrder } from './hooks/use-order';
import { OrderPopupRoute } from './hooks/use-popup-route';
import { PayProvider } from '@polyv/live-watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarMobileOrder = getIarComponent('MobileOrder');
const IarMobileAddressList = getIarComponent('MobileAddressList');
const IarMobileAddressEdit = getIarComponent('MobileAddressEdit');

const {
  orderSdk,
  addressManagementSdk,

  visible,
  orderPopupTitle,
  submitting,
  products,
  areaPickVisible,
  address,
  addressEditRef,
  addressSaveType,
  currentPopupRoute,
  isFillBodySection,
  onPopupBack,
  navigateToAddressList,
  navigateToAddressEdit,
  onSelectAddress,
  onAreaSelectorClick,
  saveAddressCb,
  onSubmitOrder,
  onAreaChange,
  showPaymentMethod,
  onChangePaymentMethod,
  loadingVisible,
  selectedPayment,
} = useOrder();

onMounted(() => {
  const interactReceiveStore = useInteractReceiveStore();
  interactReceiveStore.getSupportPayProvider();
});

// 重新渲染订单组件以恢复组件内的默认状态
const showOrderComp = ref(false);

/**
 * popup关闭
 */
function handleAfterLeave() {
  showOrderComp.value = false;
  selectedPayment.value = PayProvider.Wechat;
}

function handleAfterEnter() {
  showOrderComp.value = true;
}
</script>

<style lang="scss">
.c-mobile-order-container {
  position: relative;
  width: 100%;
  height: 100%;

  .plv-iar-order__bottom {
    @include iphone-x-pb(16px);
  }

  .plv-iar-address-list-bottom {
    @include iphone-x-pb(16px);
  }

  .plv-iar-address-edit-bottom {
    @include iphone-x-pb(16px);
  }

  .c-mobile-order-popup__loading-container {
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
}
</style>
