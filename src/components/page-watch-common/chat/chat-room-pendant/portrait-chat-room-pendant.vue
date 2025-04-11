<!-- @file 竖屏端右下角挂件 -->
<template>
  <div class="c-portrait-chat-room-pendant">
    <template v-if="iarSdkLoaded">
      <!-- 风险测评 -->
      <risk-evaluation-entrance
        v-if="riskEvaluationEntranceEnabled"
        class="c-portrait-chat-room-pendant__item"
      />

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

      <template v-if="useV2Lottery">
        <!-- 抽奖 -->
        <lottery-pendant-v2 class="c-portrait-chat-room-pendant__item" />
      </template>
      <template v-else>
        <!-- 抽奖挂件 -->
        <portrait-lottery-pendant class="c-portrait-chat-room-pendant__item" />
        <!-- 条件抽奖 -->
        <mobile-welfare-lottery class="c-portrait-chat-room-pendant__item" />
      </template>

      <!-- 平台抽奖 -->
      <mobile-lucky-lottery-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 抢答 -->
      <mobile-rush-answer class="c-portrait-chat-room-pendant__item" />

      <!-- 任务活动 -->
      <mobile-task-activity-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 商品库卡片气泡 -->
      <portrait-product-bubble :product-dialog-enable="false" />

      <!-- 优惠券 -->
      <mobile-coupon-pendant class="c-portrait-chat-room-pendant__item" />

      <!-- 情绪反馈 -->
      <mobile-emotional-feedback
        v-if="!likeFeatureEnabled && chatSetting.emotionalFeedbackEnabled && !isPlaybacking"
        class="c-portrait-chat-room-pendant__item"
      />
    </template>
    <!-- 图标广告 -->
    <mobile-img-advert class="c-mobile-chat-room-pendant__item" />
  </div>
</template>

<script setup lang="ts">
import { RiskEvaluationEntrance } from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import MobileEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import PortraitPushCard from '@/components/page-watch-common/interactive-receive/push-card/mobile-push-card.vue';
import MobileRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import MobileWelfareLottery from '@/components/page-watch-common/interactive-receive/welfare-lottery/mobile-welfare-lottery.vue';
import MobileTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/mobile-topic-pk.vue';
import MobileRushAnswer from '../../interactive-receive/rush-answer/mobile-rush-answer.vue';
import PortraitProductBubble from '@/components/page-watch-common/interactive-receive/product/portrait-product-bubble.vue';
import PortraitMicroActivityPendant from '@/components/page-watch-common/micro-activity/portrait-micro-activity/portrait-micro-activity-pendant.vue';
import PortraitLotteryPendant from '@/components/page-watch-common/interactive-receive/lottery/lottery-pendant.vue';
import MobileEmotionalFeedback from '../chat-emotional-feedback/mobile-emotional-feedback.vue';
import MobileTaskActivityPendant from '../../task-activity/mobile-task-activity-pendant.vue';
import mobileImgAdvert from '@/components/page-watch-common/icon-advert/mobile-img-advert.vue';
import MobileCouponPendant from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/coupon-pendant.vue';
import MobileLuckyLotteryPendant from '@/components/page-watch-common/interactive-receive-v2/lucky-lottery/mobile-lucky-lottery-entrance.vue';
import LotteryPendantV2 from '../../interactive-receive-v2/lottery-v2/lottery-pendant/lottery-pendant.vue';

import { useChatStore } from '@/store/use-chat-store';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useFinanceStore } from '@/store/use-finance-store';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);

const { iarSdkLoaded, useV2Lottery } = storeDefinitionToRefs(useInteractReceiveStore);

const { microActivityEnabled } = storeDefinitionToRefs(useMicroActivityStore);

const { isPlaybacking } = storeDefinitionToRefs(usePlaybackStore);
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
