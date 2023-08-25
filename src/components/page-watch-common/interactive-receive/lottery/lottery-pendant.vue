<template>
  <iar-mobile-lottery-pendant
    v-if="interactSetting.conditionLotteryEnabled"
    :lottery-sdk="lotterySdk"
    :lottery-manual-end-enabled="interactSetting.lotteryManualEndEnabled ? 'Y' : 'N'"
    :delay-time="delayTime"
    @is-show-changed="onPendantVisibleChange"
    @show-lottery="onShowLottery"
  />
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePlayerStore } from '@/store/use-player-store';
import { IarLotteryStatus } from '@polyv/live-watch-sdk';
import { getIarComponent } from '../load-iar-ui';
import { useLotterySdk } from './hooks/use-lottery-sdk';

const { lotterySdk, openLotteryByStatus } = useLotterySdk();

const IarMobileLotteryPendant = getIarComponent('LotteryPendant');

const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

const { delayTime } = storeDefinitionToRefs(usePlayerStore);

function onPendantVisibleChange(visible: boolean) {
  const interactReceiveStore = useInteractReceiveStore();
  interactReceiveStore.$patch({
    lotteryPendantVisible: visible,
  });
}

function onShowLottery(status: IarLotteryStatus) {
  openLotteryByStatus(status);
}
</script>
