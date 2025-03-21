<!-- @file PC 端互动功能接收端组件渲染入口 (显示位置位于播放器上层右侧宽度占比30%) -->
<template>
  <div class="c-pc-iar-render-upper-player-v2">
    <!-- 优惠券领取弹层 -->
    <pc-coupon-common-side-popup />
  </div>
</template>

<script setup lang="ts">
import PcCouponCommonSidePopup from '../interactive-receive-v2/coupon-v2/pc-coupon-common-side-popup.vue';
</script>

<style lang="scss">
.c-pc-iar-render-upper-player-v2 {
  position: absolute;
  width: 100%;
  height: 100%;
  * {
    pointer-events: initial;
  }
}
</style>
