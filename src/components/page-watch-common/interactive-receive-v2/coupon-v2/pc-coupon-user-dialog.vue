<!-- @file PC 端优惠券已领取弹窗 -->
<template>
  <pc-dialog
    class="c-pc-coupon-user-dialog"
    :mount-el="dialogMountEl"
    :title="couponUserListTitle"
    :visible.sync="couponUserListVisible"
  >
    <iar-normal-coupon-user-list
      ref="couponUserListRef"
      v-if="targetInited"
      :coupon-target="getIarTarget()"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

import { useLayoutStore } from '@/store/use-layout-store';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { useCouponUserList } from './hooks/use-coupon-user-list-v2';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-coupon-ui');

const {
  targetInited,
  getIarTarget,
  couponUserListVisible,
  couponUserListTitle,
  couponUserListRef,
} = useCouponUserList();

const layoutStore = useLayoutStore();

/** 弹层渲染节点 */
const dialogMountEl = computed(() => {
  return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : '';
});

const IarNormalCouponUserList = defineAsyncComponent(() => loadIarUI('normal-coupon-user-list'));
</script>
