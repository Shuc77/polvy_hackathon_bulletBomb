<!-- @file 移动端 + 竖屏端抽奖结果 -->
<template>
  <mobile-popup
    class="c-mobile-lottery-result-popup"
    :visible.sync="lotteryResultVisible"
    :title="lotteryResultTitle"
    :backable="showBackable"
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    @click-back="backLotteryResult"
  >
    <iar-mobile-lottery-end
      ref="lotteryResultInstance"
      :lottery-sdk="lotterySdk"
      @to-show="setLotteryResultVisible(true)"
      @to-hide="setLotteryResultVisible(false)"
      @status-changed="onStatusChanged"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { useLotteryResult } from './hooks/use-lottery-result';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileLotteryEnd = getIarComponent('MobileLotteryEnd');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const {
  lotterySdk,
  lotteryResultTitle,
  lotteryResultInstance,
  lotteryResultVisible,
  showBackable,
  setLotteryResultVisible,
  backLotteryResult,
  onStatusChanged,
} = useLotteryResult();
</script>
