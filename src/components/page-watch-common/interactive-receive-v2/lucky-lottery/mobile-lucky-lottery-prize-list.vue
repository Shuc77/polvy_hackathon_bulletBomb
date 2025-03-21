<!-- 移动端平台抽奖活动列表 -->
<template>
  <iar-mobile-lucky-lottery-prize-list
    v-if="targetInited"
    ref="prizeListRef"
    :lucky-lottery-target="getIarTarget()"
    @open-receive="openLotteryReceive"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import type { PolyvLuckyLotteryPrizeItem } from '@polyv/live-watch-sdk';
import type { LotteryRecordInstance } from '@polyv/iar-lucky-lottery-ui';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryPrizeList = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-prize-list'),
);
const { targetInited, getIarTarget } = useLotteryTarget();

const { getEmitter } = useGlobalInject();

const prizeListRef = ref<LotteryRecordInstance>();

function openLotteryReceive(data: PolyvLuckyLotteryPrizeItem) {
  getEmitter().emit(appEvents.iar.OpenLuckyLotteryReceiveDialog, data.recordId);
}

useEventBusListener(appEvents.iar.RefreshLuckyLotteryPrizeList, () => {
  prizeListRef.value?.refreshPrizeList();
});
</script>
