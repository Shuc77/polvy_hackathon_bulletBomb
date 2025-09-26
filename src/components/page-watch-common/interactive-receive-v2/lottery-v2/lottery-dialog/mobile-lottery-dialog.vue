<!-- 抽奖弹层 -->
<template>
  <iar-lottery-dialog
    v-if="targetInited"
    ref="dialogRef"
    :lottery-target="getIarTarget()"
    :lottery-config="lotteryConfig"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryTarget } from '../use-lottery-v2';
import { useLotteryDialog } from './use-lottery-dialog';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryDialog = defineAsyncComponent(() => loadIarUI('lottery-dialog'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

const { dialogRef } = useLotteryDialog();
</script>
