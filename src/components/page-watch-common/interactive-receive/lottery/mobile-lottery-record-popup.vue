<!-- @file 移动端+竖屏端中奖记录弹层 -->
<template>
  <mobile-popup
    class="c-mobile-lottery-record-popup"
    :visible.sync="lotteryRecordVisible"
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :title="lotteryRecordTitle"
  >
    <iar-mobile-lottery-record
      :lottery-sdk="lotterySdk"
      @lottery-list="onLotteryListChanged"
      @submit-info="onShowLotteryResult"
      @check-info="onShowLotteryResult"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import {
  lotteryRecordEmits,
  lotteryRecordProps,
  useLotteryRecord,
} from './hooks/use-lottery-record';

const IarMobileLotteryRecord = getIarComponent('MobileLotteryRecord');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const props = defineProps(lotteryRecordProps());

const emit = defineEmits(lotteryRecordEmits());

const {
  lotterySdk,
  lotteryRecordVisible,
  onLotteryListChanged,
  onShowLotteryResult,
  lotteryRecordTitle,
} = useLotteryRecord({
  props,
  emit,
});
</script>
