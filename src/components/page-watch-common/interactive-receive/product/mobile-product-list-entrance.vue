<!-- @file 横屏商品库入口 -->
<template>
  <div class="c-mobile-product-list-entrance">
    <div class="c-mobile-product-list-entrance__total">{{ productTotal }}</div>
    <div
      class="c-portrait-product-list-entrance__btn"
      @click="onClickEntrance"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useProduct } from './hooks/use-product';
import { ref } from 'vue';

const { getEmitter } = useGlobalInject();

function onClickEntrance() {
  getEmitter().emit(appEvents.interaction.OpenPortraitProductList, true);
}

const { productSdk } = useProduct();

const productTotal = ref<number>(0);

(async () => {
  const { total = 0 } = await productSdk.getProductList();
  productTotal.value = total;
})();
</script>
<style lang="scss">
.c-mobile-product-list-entrance {
  position: relative;
}
.c-portrait-product-list-entrance__btn {
  position: absolute;
  width: 100%;
  height: 100%;
}
.c-mobile-product-list-entrance__total {
  position: absolute;
  width: 100%;
  height: 100%;
  font-family: DINProFont;
  font-size: 12px;
  line-height: 46px;
  text-align: center;
}
</style>
