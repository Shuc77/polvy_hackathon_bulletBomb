<!-- 移动端中奖记录列表 -->
<template>
  <iar-mobile-lottery-record
    v-if="targetInited"
    ref="recordRef"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
    @open-receive="openLotteryReceive"
    @record-list="onRecordList"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useLotteryTarget } from './use-lottery-v2';
import { useLotteryRecordList } from './hooks/use-lottery-record-list';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarMobileLotteryRecord = defineAsyncComponent(() => loadIarUI('mobile-lottery-record'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

const { recordRef, openLotteryReceive, onRecordList } = useLotteryRecordList();
</script>
