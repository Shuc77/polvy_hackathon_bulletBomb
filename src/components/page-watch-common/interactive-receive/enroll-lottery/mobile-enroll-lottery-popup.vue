<!-- @file 移动端报名抽奖弹层 -->
<template>
  <mobile-popup
    class="c-mobile-enroll-lottery-popup"
    :visible.sync="dialogVisible"
    :title="$lang('interact.enrollLottery.title')"
    :update-on-resize="true"
  >
    <div class="c-mobile-enroll-lottery-popup__inner-wrapper">
      <iar-mobile-enroll-lottery
        :enroll-lottery-sdk="enrollLotterySdk"
        @to-show="updateDialogVisible(true)"
        @to-hide="updateDialogVisible(false)"
      />
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useEnrollLottery } from './hooks/use-enroll-lottery';

const IarMobileEnrollLottery = getIarComponent('MobileEnrollLottery');

const { enrollLotterySdk, dialogVisible, updateDialogVisible } = useEnrollLottery();
</script>

<style lang="scss">
.c-mobile-enroll-lottery-popup__inner-wrapper {
  height: auto;
  overflow-y: auto;
}
</style>
