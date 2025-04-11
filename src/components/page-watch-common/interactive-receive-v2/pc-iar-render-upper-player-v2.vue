<!-- @file PC 端互动功能接收端组件渲染入口 (显示位置位于播放器上层右侧宽度占比30%) -->
<template>
  <div class="c-pc-iar-render-upper-player-v2">
    <!-- 优惠券领取弹层 -->
    <pc-coupon-common-side-popup />
    <!-- 抽奖弹层 -->
    <pc-lottery-dialog />
  </div>
</template>

<script setup lang="ts">
import PcCouponCommonSidePopup from '../interactive-receive-v2/coupon-v2/pc-coupon-common-side-popup.vue';
import PcLotteryDialog from '@/components/page-watch-common/interactive-receive-v2/lottery-v2/lottery-dialog/pc-lottery-dialog.vue';
</script>

<style lang="scss">
.c-pc-iar-render-upper-player-v2 {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  pointer-events: initial;
}
</style>
