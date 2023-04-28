<!-- @file PC 端抽奖结果 -->
<template>
  <pc-dialog
    class="c-pc-lottery-lottery-result-dialog"
    draggable
    :visible.sync="lotteryResultVisible"
    :mask="false"
    :title="lotteryResultTitle"
  >
    <iar-pc-lottery-end
      ref="lotteryResultInstance"
      :lottery-sdk="lotterySdk"
      @to-show="setLotteryResultVisible(true)"
      @to-hide="setLotteryResultVisible(false)"
      @status-changed="onStatusChanged"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useLotteryResult } from './hooks/use-lottery-result';

const IarPcLotteryEnd = getIarComponent('PcLotteryEnd');

const {
  lotterySdk,
  lotteryResultTitle,
  lotteryResultInstance,
  lotteryResultVisible,
  onStatusChanged,
  setLotteryResultVisible,
} = useLotteryResult();
</script>
