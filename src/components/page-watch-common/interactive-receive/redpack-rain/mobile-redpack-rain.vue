<!-- @file 移动端+竖屏端红包雨 -->
<template>
  <iar-mobile-redpack-rain
    class="c-mobile-redpack-rain"
    ref="redpackRainRef"
    :redpack-rain="redpackRainSdk"
    :custom-img-config="customImgConfig"
    :with-draw-enabled="withdrawEnabled"
    :redirect-url="watchUrl"
    :unit="scoreUnit"
    @copy-success="toastCopySuccess"
    @state-change="onStateChange"
    @visible-change="onVisibleChange"
    @click-withdraw="onClickWithdraw"
    @click-point-record="onClickScoreRecord"
  />
</template>

<script setup lang="ts">
import { toastCopySuccess } from '@/assets/utils/copy';
import { useWithdraw } from '@/components/page-watch-common/withdraw/use-withdraw';
import { useRedpackRain } from './hooks/use-redpack-rain';

import { useChannelStore } from '@/store/use-channel-store';
import { useScoreStore } from '@/store/use-score-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileRedpackRain = getIarComponent('MobileRedpackRain');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { scoreUnit } = storeDefinitionToRefs(useScoreStore);

const {
  redpackRainSdk,
  customImgConfig,
  redpackRainRef,
  onStateChange,
  onVisibleChange,
  onClickWithdraw,
  onClickScoreRecord,
} = useRedpackRain();

const { withdrawEnabled } = useWithdraw();
</script>
