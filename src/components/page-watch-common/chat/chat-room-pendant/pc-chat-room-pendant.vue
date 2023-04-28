<!-- @file PC 端聊天室右下角挂件 -->
<template>
  <div
    class="c-pc-chat-room-pendant"
    v-if="!isWatchBackUrl"
  >
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

    <!-- 条件抽奖 -->
    <pc-welfare-lottery class="c-pc-chat-room-pendant__item" />

    <!-- 点赞 -->
    <pc-chat-like
      v-if="likeEnabled"
      class="c-pc-chat-room-pendant__item"
      :upper-has-icon="hasOtherPendant"
    />
    <!-- 情绪反馈 -->
    <pc-emotional-feedback
      v-else-if="emotionalFeedbackEnabled"
      class="c-pc-chat-room-pendant__item"
    />
  </div>
</template>

<script setup lang="ts">
import PcEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import PcPushCard from '@/components/page-watch-common/interactive-receive/push-card/pc-push-card.vue';
import PcRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import PcWelfareLottery from '@/components/page-watch-common/interactive-receive/welfare-lottery/pc-welfare-lottery.vue';
import PcTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/pc-topic-pk.vue';
import PcEmotionalFeedback from '../chat-emotional-feedback/pc-emotional-feedback.vue';
import PcChatLike from '../chat-like/pc-chat-like.vue';
import RiskEvaluationEntrance from '@/components/page-watch-common/interactive-receive/risk-evaluation/common/risk-evaluation-entrance.vue';

import { useChatStore } from '@/store/use-chat-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { computed, unref } from 'vue';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useFinanceStore } from '@/store/use-finance-store';

const { likeEnabled, emotionalFeedbackEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);

const { isWatchBackUrl } = storeDefinitionToRefs(useWatchAppStore);

const {
  pushCardPendantVisible,
  redpackPendantVisible,
  enrollLotteryPendantVisible,
  welfareLotteryPendantVisible,
} = storeDefinitionToRefs(useInteractReceiveStore);

/** 点赞上方是否有其他挂件 */
const hasOtherPendant = computed<boolean>(() => {
  return (
    unref(pushCardPendantVisible) ||
    unref(redpackPendantVisible) ||
    unref(enrollLotteryPendantVisible) ||
    unref(welfareLotteryPendantVisible)
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
