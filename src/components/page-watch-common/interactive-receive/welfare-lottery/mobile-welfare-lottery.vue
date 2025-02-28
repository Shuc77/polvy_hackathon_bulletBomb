<!-- @file 移动端+竖屏端条件抽奖 -->
<template>
  <iar-mobile-welfare-lottery
    v-show="welfareLotteryPendantVisible"
    class="c-mobile-welfare-lottery"
    :welfare-lottery-sdk="welfareLotterySdk"
    :watch-url="watchUrl"
    :invite-url="generatePosterUrl"
    :is-auto-popper="interactSetting.conditionLotteryAutoPopperEnabled"
    :is-full-screen="isIarFullScreen"
    :before-join-lottery="beforeJoinLottery"
    :btn-text="interactSetting.lotteryGiftButtonTextCH"
    :btn-en-text="interactSetting.lotteryGiftButtonTextEN"
    :privacy-content="privacyContent"
    custom-record
    custom-receive
    @comment-success="onCommentSuccess"
    @to-fill-questionnaire="onToFillQuestionnaire"
    @visible-changed="onWelfareLotteryVisibleChanged"
    @entry-visible-changed="onEntryVisibleChanged"
    @open-record="onOpenRecord"
    @open-receive="onOpenReceive"
  />
</template>

<script setup lang="ts">
import { useWelfareLottery } from './hooks/use-welfare-lottery';

import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useLotteryPrivacy } from '@/components/page-watch-common/interactive-receive/lottery/hooks/use-lottery-privacy';

const IarMobileWelfareLottery = getIarComponent('MobileWelfareLottery');

const { watchUrl } = storeDefinitionToRefs(useChannelStore);

const { generatePosterUrl } = storeDefinitionToRefs(useInviteStore);

const { isIarFullScreen, welfareLotteryPendantVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const {
  welfareLotterySdk,

  beforeJoinLottery,
  onCommentSuccess,
  onWelfareLotteryVisibleChanged,
  onEntryVisibleChanged,

  onToFillQuestionnaire,
  onOpenRecord,
  onOpenReceive,
} = useWelfareLottery();

const { privacyContent } = useLotteryPrivacy();
</script>

<style lang="scss">
.plv-iar-modal__wrap--fullscreen {
  .plv-iar-modal__wrap--fullscreen,
  .plv-iar-modal {
    width: $--plv-mobile-watch-full-screen-vh !important;
  }
}
</style>
