<!-- 抽奖挂件 -->
<template>
  <iar-lottery-pendant
    v-if="targetInited"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryPendant } from './use-lottery-pendant';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryPendant = defineAsyncComponent(() => loadIarUI('lottery-pendant'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryPendant();
</script>
