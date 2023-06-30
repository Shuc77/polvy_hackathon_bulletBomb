<!-- @file 移动端商品库职位详情 -->
<template>
  <mobile-popup
    class="c-mobile-product-job-detail-popup"
    :visible.sync="visible"
    :title="$lang('interact.product.jobDetail')"
  >
    <iar-product-job-detail
      v-if="productSdk && jobDetail"
      :product-sdk="productSdk"
      :job-detail="jobDetail"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      use-mobile-class
      @click-buy="trackProductListItemClick"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useProduct, useProductLinkParams, useProductTrack } from './hooks/use-product';
import { useProductJobDetail } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';

const IarProductJobDetail = getIarComponent('ProductJob');

const { productSdk } = useProduct();

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useProductLinkParams();

const { visible, jobDetail } = useProductJobDetail();

const { trackProductListItemClick } = useProductTrack();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
