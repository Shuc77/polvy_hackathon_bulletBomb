<!-- @file PC 端中奖记录列表 -->
<template>
  <div class="c-pc-lottery-record pws-pc-lottery-record">
    <div class="c-pc-lottery-record__close">
      <pc-icon-close
        class="c-pc-lottery-record__close__icon pws-pc-lottery-record-close-icon"
        @click="setLotteryRecordVisible(false)"
      />
    </div>
    <div class="c-pc-lottery-record__content pws-pc-lottery-record-scrollbar">
      <iar-pc-lottery-record
        :lottery-sdk="lotterySdk"
        @lottery-list="onLotteryListChanged"
        @submit-info="onShowLotteryResult"
        @check-info="onShowLotteryResult"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import {
  lotteryRecordEmits,
  lotteryRecordProps,
  useLotteryRecord,
} from './hooks/use-lottery-record';

const IarPcLotteryRecord = getIarComponent('PcLotteryRecord');

const props = defineProps(lotteryRecordProps());

const emit = defineEmits(lotteryRecordEmits());

const { lotterySdk, onLotteryListChanged, onShowLotteryResult, setLotteryRecordVisible } =
  useLotteryRecord({ props, emit });
</script>

<style lang="scss">
.c-pc-lottery-record {
  display: flex;
  flex-direction: column;
  height: 232px;
  padding: 8px 0;
  overflow: hidden;
}

.c-pc-lottery-record__close {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  width: 100%;
  height: 24px;
  padding-right: 14px;
}

.c-pc-lottery-record__close__icon {
  display: flex;
  font-size: 24px !important;
  color: #fff;
  cursor: pointer;
}

.c-pc-lottery-record__content {
  flex: 1;
  overflow-y: auto;
  @include scrollbar;
}
</style>
