<!-- @file PC 端报名抽奖弹层 -->
<template>
  <pc-dialog
    class="c-pc-enroll-lottery-dialog"
    :visible.sync="dialogVisible"
    draggable
    :mask="false"
    :title="$lang('interact.enrollLottery.title')"
  >
    <iar-pc-enroll-lottery
      :enroll-lottery-sdk="enrollLotterySdk"
      @to-show="updateDialogVisible(true)"
      @to-hide="updateDialogVisible(false)"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useEnrollLottery } from './hooks/use-enroll-lottery';

const IarPcEnrollLottery = getIarComponent('PcEnrollLottery');

const { enrollLotterySdk, dialogVisible, updateDialogVisible } = useEnrollLottery();
</script>
