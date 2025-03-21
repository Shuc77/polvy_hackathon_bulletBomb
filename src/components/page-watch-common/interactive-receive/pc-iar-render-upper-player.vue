<!-- @file PC 端互动功能接收端组件渲染入口 (显示位置位于播放器上层右侧宽度占比30%) -->
<template>
  <div class="c-pc-iar-render-upper-player">
    <!-- 商品详情弹层 -->
    <pc-product-detail />
  </div>
</template>

<script setup lang="ts">
import PcProductDetail from '@/components/page-watch-common/product-detail/pc-product-detail.vue';
</script>

<style lang="scss">
.c-pc-iar-render-upper-player {
  position: absolute;
  width: 100%;
  height: 100%;
  * {
    pointer-events: initial;
  }
}
</style>
