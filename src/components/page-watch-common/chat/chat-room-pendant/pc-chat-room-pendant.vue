<!-- @file PC 端聊天室右下角挂件 -->
<template>
  <div class="c-pc-chat-room-pendant">
    <template v-if="iarSdkLoaded">
      <!-- 风险测评 -->
      <risk-evaluation-entrance
        v-if="riskEvaluationEntranceEnabled"
        class="c-pc-chat-room-pendant__item"
      />

      <!-- 卡片推送 -->
      <pc-push-card class="c-pc-chat-room-pendant__item" />

      <!-- 红包 -->
      <pc-redpack-pendant class="c-pc-chat-room-pendant__item" />

      <!-- 报名抽奖 -->
      <pc-enroll-lottery-pendant class="c-pc-chat-room-pendant__item" />

      <!-- 话题 PK -->
      <pc-topic-pk class="c-pc-chat-room-pendant__item" />

      <!-- 抽奖 -->
      <pc-lottery-pendant class="c-pc-chat-room-pendant__item" />

      <!-- 条件抽奖 -->
      <pc-welfare-lottery class="c-pc-chat-room-pendant__item" />

      <!-- 抢答 -->
      <pc-rush-answer class="c-pc-chat-room-pendant__item" />

      <!-- 情绪反馈 -->
      <pc-emotional-feedback
        v-if="!likeFeatureEnabled && chatSetting.emotionalFeedbackEnabled"
        class="c-pc-chat-room-pendant__item"
      />
    </template>
    <!-- 图标广告 -->
    <pc-img-advert class="c-pc-chat-room-pendant__item" />

    <!-- 点赞 -->
    <pc-chat-like
      v-if="likeFeatureEnabled"
      class="c-pc-chat-room-pendant__item"
      :upper-has-icon="hasOtherPendant"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';

import PcEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import PcPushCard from '@/components/page-watch-common/interactive-receive/push-card/pc-push-card.vue';
import PcRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import PcWelfareLottery from '@/components/page-watch-common/interactive-receive/welfare-lottery/pc-welfare-lottery.vue';
import PcLotteryPendant from '@/components/page-watch-common/interactive-receive/lottery/lottery-pendant.vue';
import PcTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/pc-topic-pk.vue';
import PcRushAnswer from '../../interactive-receive/rush-answer/pc-rush-answer.vue';
import PcEmotionalFeedback from '../chat-emotional-feedback/pc-emotional-feedback.vue';
import PcChatLike from '../chat-like/pc-chat-like.vue';
import PcImgAdvert from '@/components/page-watch-common/icon-advert/pc-img-advert.vue';
import { RiskEvaluationEntrance } from '@/components/page-watch-common/interactive-receive/risk-evaluation';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useFinanceStore } from '@/store/use-finance-store';

const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);

const {
  iarSdkLoaded,

  pushCardPendantVisible,
  redpackPendantVisible,
  enrollLotteryPendantVisible,
  welfareLotteryPendantVisible,
  lotteryPendantVisible,
  rushAnswerPendantVisible,
} = storeDefinitionToRefs(useInteractReceiveStore);

/** 点赞上方是否有其他挂件 */
const hasOtherPendant = computed<boolean>(() => {
  return (
    unref(pushCardPendantVisible) ||
    unref(redpackPendantVisible) ||
    unref(enrollLotteryPendantVisible) ||
    unref(lotteryPendantVisible) ||
    unref(welfareLotteryPendantVisible) ||
    unref(rushAnswerPendantVisible)
  );
});
</script>

<style lang="scss">
.c-pc-chat-room-pendant {
  position: absolute;
  right: 12px;
  bottom: 21px;
  width: 40px;
}

.c-pc-chat-room-pendant__item:empty {
  display: none;
}

.c-pc-chat-room-pendant__item + .c-pc-chat-room-pendant__item {
  margin-top: 12px;
}
</style>
