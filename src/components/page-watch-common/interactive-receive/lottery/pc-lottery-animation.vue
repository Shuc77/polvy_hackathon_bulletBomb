<!-- @file PC 端抽奖动画 -->
<template>
  <iar-pc-on-lottery
    ref="lotteryAniRef"
    class="c-pc-lottery-animation"
    v-show="lotteryAnimationVisible"
    :lottery-sdk="lotterySdk"
    :btn-text="interactSetting.lotteryGiftButtonTextCH"
    :btn-en-text="interactSetting.lotteryGiftButtonTextEN"
    @lottery-status-changed="onLotteryStatusChange"
    @is-show-changed="onVisibleChange"
  />
</template>

<script setup lang="ts">
import { useLotteryAnimation } from './hooks/use-lottery-animation';

import { useAppendTo } from '@/hooks/behaviors/use-append-to';
import { ref } from 'vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const IarPcOnLottery = getIarComponent('PcOnLottery');

const lotteryAniRef = ref();

useAppendTo(lotteryAniRef);

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { lotterySdk, lotteryAnimationVisible, onLotteryStatusChange, onVisibleChange } =
  useLotteryAnimation();
</script>
