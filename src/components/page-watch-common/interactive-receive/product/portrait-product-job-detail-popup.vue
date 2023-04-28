<!-- @file 竖屏端商品库职位详情 -->
<template>
  <mobile-popup
    class="c-portrait-product-job-detail-popup"
    :visible.sync="visible"
    :title="$lang('interact.product.jobDetail')"
    content-percent-height
  >
    <iar-product-job-detail
      v-if="productSdk && jobDetail"
      :product-sdk="productSdk"
      :job-detail="jobDetail"
      use-mobile-class
      @click-buy="trackProductListItemClick"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useProduct, useProductTrack } from './hooks/use-product';
import { useProductJobDetail } from './hooks/use-product-job-detail';

const IarProductJobDetail = getIarComponent('ProductJob');

const { productSdk } = useProduct();

const { visible, jobDetail } = useProductJobDetail();

const { trackProductListItemClick } = useProductTrack();
</script>
