<!-- @file 优惠券挂件 -->
<template>
  <div
    class="c-coupon-pendant"
    @click="showCouponCommonList"
  >
    <iar-normal-coupon-pendant
      v-if="targetInited"
      :coupon-target="getIarTarget()"
      :visible="couponPendantVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useCouponCommonPendantV2 } from './hooks/use-coupon-entrance-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const { couponPendantVisible, showCouponCommonList, targetInited, getIarTarget } =
  useCouponCommonPendantV2();

const IarNormalCouponPendant = defineAsyncComponent(() => loadIarUI('normal-coupon-pendant'));
</script>
