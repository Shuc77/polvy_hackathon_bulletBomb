<!-- @file 报名抽奖挂件 -->
<template>
  <iar-enroll-lottery-pendant
    class="c-enroll-lottery-pendant"
    :enroll-lottery-sdk="enrollLotterySdk"
    :auto-fetch-detail="autoFetchDetail"
    @to-show-modal="showEnrollLotteryDialog"
    @entry-visible-changed="onEntryVisibleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useChannelStore } from '@/store/use-channel-store';
import { ynToBool } from '@utils-ts/boolean';
import { YN } from '@polyv/live-watch-sdk';

const IarEnrollLotteryPendant = getIarComponent('EnrollLotteryPendant');

const watchCore = getWatchCore();
/** 报名抽奖实例 */
const enrollLotterySdk = watchCore.interactReceive.getEnrollLottery();

const channelStore = useChannelStore();
/** 自动请求详情 */
const autoFetchDetail = computed(() => {
  return ynToBool(channelStore.channelDetail?.channelConfig.enrollLotteryEnabled, YN.N);
});

const interactReceiveStore = useInteractReceiveStore();
function onEntryVisibleChange(visible = true) {
  interactReceiveStore.$patch({
    enrollLotteryPendantVisible: visible,
  });
}

function showEnrollLotteryDialog() {
  eventBus.$emit(appEvents.interaction.OpenEnrollLottery, true);
}
</script>
