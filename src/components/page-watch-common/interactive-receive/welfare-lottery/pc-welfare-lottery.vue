<!-- @file PC 端条件抽奖入口 -->
<template>
  <iar-pc-welfare-lottery
    v-show="welfareLotteryPendantVisible"
    class="c-pc-welfare-lottery"
    :welfare-lottery-sdk="welfareLotterySdk"
    :watch-url="watchUrl"
    :is-auto-popper="interactSetting.conditionLotteryAutoPopperEnabled"
    :before-join-lottery="beforeJoinLottery"
    :btn-text="interactSetting.lotteryGiftButtonTextCH"
    :btn-en-text="interactSetting.lotteryGiftButtonTextEN"
    :privacy-content="privacyContent"
    custom-record
    custom-receive
    @comment-success="onCommentSuccess"
    @to-fill-questionnaire="onToFillQuestionnaire"
    @entry-visible-changed="onEntryVisibleChanged"
    @open-record="onOpenRecord"
    @open-receive="onOpenReceive"
  />
</template>

<script setup lang="ts">
import { useWelfareLottery } from './hooks/use-welfare-lottery';

import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useLotteryPrivacy } from '@/components/page-watch-common/interactive-receive/lottery/hooks/use-lottery-privacy';

const IarPcWelfareLottery = getIarComponent('PcWelfareLottery');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { welfareLotteryPendantVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const {
  welfareLotterySdk,

  beforeJoinLottery,
  onCommentSuccess,
  onEntryVisibleChanged,

  onToFillQuestionnaire,
  onOpenRecord,
  onOpenReceive,
} = useWelfareLottery();

const { privacyContent } = useLotteryPrivacy();
</script>
