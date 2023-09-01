<!-- @file 竖屏端右下角挂件 -->
<template>
  <div class="c-portrait-chat-room-pendant">
    <!-- 微活动 -->
    <portrait-micro-activity-pendant
      v-if="microActivityEnabled"
      class="c-portrait-chat-room-pendant__item"
    />

    <!-- 卡片推送 -->
    <portrait-push-card class="c-portrait-chat-room-pendant__item" />

    <!-- 红包 -->
    <mobile-redpack-pendant class="c-portrait-chat-room-pendant__item" />

    <!-- 报名抽奖 -->
    <mobile-enroll-lottery-pendant class="c-portrait-chat-room-pendant__item" />

    <!-- 话题 PK -->
    <mobile-topic-pk class="c-portrait-chat-room-pendant__item" />

    <!-- 抽奖挂件 -->
    <portrait-lottery-pendant class="c-portrait-chat-room-pendant__item" />

    <!-- 条件抽奖 -->
    <mobile-welfare-lottery class="c-portrait-chat-room-pendant__item" />

    <!-- 抢答 -->
    <mobile-rush-answer class="c-portrait-chat-room-pendant__item" />

    <!-- 点赞 -->
    <portrait-chat-like
      v-if="likeFeatureEnabled && !isPlaybacking"
      class="c-portrait-chat-room-pendant__item"
      :upper-has-icon="hasOtherPendant"
    />
    <!-- 情绪反馈 -->
    <mobile-emotional-feedback
      v-else-if="chatSetting.emotionalFeedbackEnabled && !isPlaybacking"
      class="c-portrait-chat-room-pendant__item"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';

import MobileEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import PortraitPushCard from '@/components/page-watch-common/interactive-receive/push-card/mobile-push-card.vue';
import MobileRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import MobileWelfareLottery from '@/components/page-watch-common/interactive-receive/welfare-lottery/mobile-welfare-lottery.vue';
import MobileTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/mobile-topic-pk.vue';
import MobileRushAnswer from '../../interactive-receive/rush-answer/mobile-rush-answer.vue';
import PortraitMicroActivityPendant from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity-pendant.vue';
import PortraitLotteryPendant from '@/components/page-watch-common/interactive-receive/lottery/lottery-pendant.vue';
import MobileEmotionalFeedback from '../chat-emotional-feedback/mobile-emotional-feedback.vue';
import PortraitChatLike from '../chat-like/portrait-chat-like.vue';

import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);

const {
  pushCardPendantVisible,
  redpackPendantVisible,
  enrollLotteryPendantVisible,
  welfareLotteryPendantVisible,
  lotteryPendantVisible,
} = storeDefinitionToRefs(useInteractReceiveStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { isPlaybacking } = storeDefinitionToRefs(usePlaybackStore);

/** 点赞上方是否有其他挂件 */
const hasOtherPendant = computed<boolean>(() => {
  return (
    unref(pushCardPendantVisible) ||
    unref(redpackPendantVisible) ||
    unref(enrollLotteryPendantVisible) ||
    unref(welfareLotteryPendantVisible) ||
    unref(lotteryPendantVisible)
  );
});
</script>

<style lang="scss">
.c-portrait-chat-room-pendant {
  position: absolute;
  right: 13px;
  bottom: 6px;
  width: 40px;
}

.c-portrait-chat-room-pendant__item + .c-portrait-chat-room-pendant__item {
  margin-top: 12px;
}
</style>
