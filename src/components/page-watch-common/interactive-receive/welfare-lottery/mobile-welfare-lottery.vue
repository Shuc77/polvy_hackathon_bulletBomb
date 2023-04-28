<!-- @file 移动端+竖屏端条件抽奖 -->
<template>
  <iar-mobile-welfare-lottery
    v-show="welfareLotteryPendantVisible"
    class="c-mobile-welfare-lottery"
    :welfare-lottery-sdk="welfareLotterySdk"
    :watch-url="watchUrl"
    :invite-url="generatePosterUrl"
    :is-auto-popper="conditionLotterySPAutoPopEnabled"
    :is-full-screen="isIarFullScreen"
    @comment-success="onCommentSuccess"
    @entry-visible-changed="onEntryVisibleChanged"
  />
</template>

<script setup lang="ts">
import { useWelfareLottery } from './hooks/use-welfare-lottery';

import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileWelfareLottery = getIarComponent('MobileWelfareLottery');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { generatePosterUrl } = storeDefinitionToRefs(useInviteStore);

const { isIarFullScreen, welfareLotteryPendantVisible } =
  storeDefinitionToRefs(useInteractReceiveStore);

const {
  welfareLotterySdk,
  conditionLotterySPAutoPopEnabled,
  onCommentSuccess,
  onEntryVisibleChanged,
} = useWelfareLottery();
</script>
