<!-- @file PC 端商品库职位详情 -->
<template>
  <pc-dialog
    class="c-pc-product-job-detail-dialog"
    :visible.sync="visible"
    :title="$lang('interact.product.jobDetail')"
  >
    <iar-product-job-detail
      v-if="productSdk && jobDetail"
      :product-sdk="productSdk"
      :job-detail="jobDetail"
      :get-link-params="getLinkParams"
      :product-link-jump-tip-enabled="interactSetting.productLinkJumpTipEnabled ? YN.Y : YN.N"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useProduct, useProductLinkParams } from './hooks/use-product';
import { useProductJobDetail } from './hooks/use-product-job-detail';
import { YN } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarProductJobDetail = getIarComponent('ProductJob');

const { productSdk } = useProduct();

const { getLinkParams } = useProductLinkParams();

const { visible, jobDetail } = useProductJobDetail();

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
