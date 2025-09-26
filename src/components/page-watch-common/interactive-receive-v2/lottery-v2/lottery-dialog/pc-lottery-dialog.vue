<!-- 抽奖弹层 -->
<template>
  <div
    ref="dialogWrapRef"
    class="c-pc-lottery-dialog"
  >
    <iar-lottery-dialog
      v-if="targetInited"
      ref="dialogRef"
      :lottery-target="getIarTarget()"
      :lottery-config="lotteryConfig"
      :receive-popup-config="receivePopupConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, unref } from 'vue';
import { useIarUILoader } from '../../_load-iar-ui-v2';
import { useLotteryTarget } from '../use-lottery-v2';
import { useLotteryDialog } from './use-lottery-dialog';

const { loadIarUI } = useIarUILoader('iar-lottery-ui');

const IarLotteryDialog = defineAsyncComponent(() => loadIarUI('lottery-dialog'));

const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

const { dialogRef } = useLotteryDialog();

const dialogWrapRef = ref<HTMLElement>();

const receivePopupConfig = computed(() => {
  return {
    position: 'right',
    appendTo: unref(dialogWrapRef),
    showModal: false,
  };
});
</script>
