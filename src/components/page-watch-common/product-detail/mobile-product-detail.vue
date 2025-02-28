<template>
  <div class="c-mobile-product-detail">
    <iar-product-detail
      class="c-mobile-product-detail__iar-product-detail"
      :product-info="productDetailInfo"
      :cover-config="productDetailCoverConfig"
      @play="handleProductDetailVideoPlay"
      @pause="handleProductDetailVideoPause"
      v-if="productDetailVisible"
      :is-mobile="() => isMobile"
      :lang="currentLang"
    />

    <span
      class="c-product-detail__close-icon"
      @click="closeProductDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useNewProductDetail } from '@/components/page-watch-common/interactive-receive/product/hooks/use-new-product-detail';
import { isMobile } from '@/assets/utils/browser';

const IarProductDetail = getIarComponent('ProductDetail');
const {
  productDetailInfo,
  productDetailCoverConfig,
  closeProductDetail,
  productDetailVisible,
  handleProductDetailVideoPlay,
  currentLang,
  handleProductDetailVideoPause,
} = useNewProductDetail();
</script>

<style lang="scss">
@import './assets/scss/product-detail.scss';

.c-mobile-product-detail {
  width: 100%;
  height: 100%;

  .plv-iar-product-detail-content {
    overflow-y: initial !important;
  }
}

.c-mobile-product-detail__iar-product-detail {
  width: 100%;
  height: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
</style>
