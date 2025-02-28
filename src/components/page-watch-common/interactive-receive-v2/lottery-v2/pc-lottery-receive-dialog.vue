<!-- 移动端中奖领取弹层 -->
<template>
  <iar-pc-lottery-receive
    v-if="targetInited"
    ref="receiveRef"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useLotteryTarget } from './use-lottery-v2';
import { useLotteryReceive } from './hooks/use-lottery-receive';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarPcLotteryReceive = defineAsyncComponent(() => loadIarUI('pc-lottery-receive'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

const { receiveRef } = useLotteryReceive();
</script>
