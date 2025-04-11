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
      :hot-effect-enabled="productHotEffectEnabled"
      :get-weixin-sdk="getWeixinSdk"
      :get-link-params="getLinkParams"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
      use-mobile-class
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useProduct } from './hooks/use-product';
import { useProductJobDetail } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useIarExternalLinkParams } from '../use-iar-external-link-params';

const IarProductJobDetail = getIarComponent('ProductJob');

const { productSdk, productHotEffectEnabled } = useProduct();

const { getWeixinSdk } = useWeixinSdk();

const { getLinkParams } = useIarExternalLinkParams();

const { visible, jobDetail } = useProductJobDetail();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
