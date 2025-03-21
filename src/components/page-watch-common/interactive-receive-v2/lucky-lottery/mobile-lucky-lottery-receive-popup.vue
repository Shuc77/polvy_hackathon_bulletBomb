<!-- 移动端平台抽奖中奖领取弹层 -->
<template>
  <iar-mobile-lucky-lottery-receive
    v-if="targetInited"
    ref="luckyLotteryReceiveRef"
    :lucky-lottery-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';
import { appEvents, useEventBusListener } from '@/app/app-events';
import type { LuckyLotteryReceiveInstance } from '@polyv/iar-lucky-lottery-ui';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryReceive = defineAsyncComponent(() =>
  loadIarUI('mobile-lucky-lottery-receive'),
);

const luckyLotteryReceiveRef = ref<LuckyLotteryReceiveInstance>();
const { targetInited, getIarTarget } = useLotteryTarget();

useEventBusListener(appEvents.iar.OpenLuckyLotteryReceiveDialog, (prizeRecordId: number) => {
  luckyLotteryReceiveRef.value?.setupRecordData(prizeRecordId);
});
</script>
