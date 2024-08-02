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
    >
      <div class="c-mobile-order-container">
        <iar-mobile-order
          v-if="currentPopupRoute === OrderPopupRoute.Order && orderSdk"
          :products="products"
          :submit-disabled="submitting"
          :address="address"
          :order-sdk="orderSdk"
          :address-management-sdk="addressManagementSdk"
          @click-address="navigateToAddressList"
          @submit="onSubmitOrder"
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
      </div>
    </mobile-popup>
    <area-picker
      :visible.sync="areaPickVisible"
      @change="onAreaChange"
    />
  </div>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import AreaPicker from '@/components/common-base/area-picker/area-picker.vue';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useOrder } from './hooks/use-order';
import { OrderPopupRoute } from './hooks/use-popup-route';

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
} = useOrder();
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
}
</style>
