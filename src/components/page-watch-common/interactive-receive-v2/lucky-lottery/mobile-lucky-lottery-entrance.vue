<!-- 移动端平台抽奖入口挂件 -->
<template>
  <iar-mobile-lucky-lottery-pendant
    v-if="targetInited"
    :is-full-screen="isIarFullScreen"
    :lucky-lottery-target="getIarTarget()"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLotteryTarget } from './use-lucky-lottery';
import { useIarUILoader } from '../_load-iar-ui-v2';

const { loadIarUI } = useIarUILoader('iar-lucky-lottery-ui');

const IarMobileLuckyLotteryPendant = defineAsyncComponent(() => loadIarUI('lucky-lottery-pendant'));
const { targetInited, getIarTarget } = useLotteryTarget();

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
