<!-- 移动端平台抽奖活动详情 -->
<template>
  <iar-mobile-lucky-lottery-detail-popup
    v-if="targetInited"
    :lucky-lottery-target="getIarTarget()"
    @click-my-prize="onClickMyPrize"
    @click-receive="onClickReceive"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import type { PolyvLuckyLotteryPrizeItem } from '@polyv/live-watch-sdk';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryDetailPopup = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-detail'),
);
const { targetInited, getIarTarget } = useLotteryTarget();

const { getEmitter } = useGlobalInject();

function onClickMyPrize() {
  getEmitter().emit(appEvents.iar.OpenLuckyLotteryPrizeListDialog);
}

function onClickReceive(prize: PolyvLuckyLotteryPrizeItem) {
  if (!targetInited.value) return;

  const luckyLotteryTarget = getIarTarget();
  if (prize.prizeType === luckyLotteryTarget.PrizeType.Custom) {
    getEmitter().emit(appEvents.iar.OpenLuckyLotteryReceiveDialog, prize.recordId);
  } else {
    onClickMyPrize();
  }
}
</script>
