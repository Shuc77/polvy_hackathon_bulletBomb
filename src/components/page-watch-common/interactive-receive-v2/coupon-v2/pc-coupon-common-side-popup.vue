<!-- @file PC 端优惠券待领取弹窗 -->
<template>
  <div
    class="c-pc-coupon-side-popup"
    ref="couponSidePopupWrapRef"
  >
    <pc-side-popup
      v-if="couponCommonListVisible"
      ref="couponSidePopupRef"
      :visible.sync="couponCommonListVisible"
      :mount-el="couponSidePopupWrapRef"
    >
      <iar-normal-coupon-common-list
        ref="couponCommonListRef"
        v-if="targetInited"
        :coupon-target="getIarTarget()"
      />
    </pc-side-popup>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import pcSidePopup from '@/components/common-base/side-poupou/pc-side-popup.vue';
import { useCouponCommonList } from './hooks/use-coupon-common-list-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  couponCommonListRef,
  targetInited,
  getIarTarget,
  couponCommonListVisible,
  couponSidePopupWrapRef,
  couponSidePopupRef,
} = useCouponCommonList();

const IarNormalCouponCommonList = defineAsyncComponent(() =>
  loadIarUI('normal-coupon-common-list'),
);
</script>
