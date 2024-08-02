<!-- @file 移动端聊天室右下角挂件 -->
<template>
  <custom-teleport :to="renderParent">
    <div
      class="c-mobile-chat-room-pendant"
      :class="{
        'c-mobile-chat-room-pendant--page-fullscreen': mobilePlayerIsPageFullscreen,
        'c-mobile-chat-room-pendant--screen__horizontal': isHorizontalScreenOrientation,
      }"
    >
      <!-- 风险测评 -->
      <risk-evaluation-entrance
        v-if="riskEvaluationEntranceEnabled"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 卡片推送 -->
      <mobile-push-card
        v-show="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 红包 -->
      <mobile-redpack-pendant class="c-mobile-chat-room-pendant__item" />

      <!-- 邀请海报 -->
      <mobile-invite-poster-entry
        v-if="mobileChatInvitePendantVisible"
        v-show="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 报名抽奖 -->
      <mobile-enroll-lottery-pendant
        v-show="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 话题 PK -->
      <mobile-topic-pk
        v-show="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 抽奖 -->
      <mobile-lottery-pendant class="c-mobile-chat-room-pendant__item" />

      <!-- 条件抽奖 -->
      <mobile-welfare-lottery class="c-mobile-chat-room-pendant__item" />

      <!-- 抢答 -->
      <mobile-rush-answer class="c-mobile-chat-room-pendant__item" />

      <!-- 任务活动 -->
      <mobile-task-activity-pendant
        v-if="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />

      <mobile-product-bubble
        v-if="iarSdkLoaded"
        :product-dialog-enable="false"
        class="c-mobile-chat-room-pendant__item"
      />

      <!-- 情绪反馈 -->
      <mobile-emotional-feedback
        v-if="!likeFeatureEnabled && chatSetting.emotionalFeedbackEnabled"
        v-show="!isPageFullscreenOrHorizontalScreen"
        class="c-mobile-chat-room-pendant__item"
      />
    </div>
  </custom-teleport>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';

import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';
import MobileEnrollLotteryPendant from '@/components/page-watch-common/interactive-receive/enroll-lottery/enroll-lottery-pendant.vue';
import MobilePushCard from '@/components/page-watch-common/interactive-receive/push-card/mobile-push-card.vue';
import MobileRedpackPendant from '@/components/page-watch-common/interactive-receive/redpack/redpack-pendant.vue';
import MobileLotteryPendant from '@/components/page-watch-common/interactive-receive/lottery/lottery-pendant.vue';
import MobileWelfareLottery from '@/components/page-watch-common/interactive-receive/welfare-lottery/mobile-welfare-lottery.vue';
import MobileTopicPk from '@/components/page-watch-common/interactive-receive/topic-pk/mobile-topic-pk.vue';
import MobileRushAnswer from '../../interactive-receive/rush-answer/mobile-rush-answer.vue';
import MobileEmotionalFeedback from '../chat-emotional-feedback/mobile-emotional-feedback.vue';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';
import MobileTaskActivityPendant from '../../task-activity/mobile-task-activity-pendant.vue';
import { RiskEvaluationEntrance } from '@/components/page-watch-common/interactive-receive/risk-evaluation';
import MobileProductBubble from '@/components/page-watch-common/interactive-receive/product/mobile-product-bubble.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useFinanceStore } from '@/store/use-finance-store';

const { chatSetting, likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);
const { riskEvaluationEntranceEnabled } = storeDefinitionToRefs(useFinanceStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { mobileChatInvitePendantVisible } = storeDefinitionToRefs(useInviteStore);

const {
  mobilePlayerIsPageFullscreen,
  isHorizontalScreenOrientation,

  isPageFullscreenOrHorizontalScreen,
} = storeDefinitionToRefs(useLayoutStore);

const renderParent = computed<string | HTMLElement>(() => {
  return unref(isPageFullscreenOrHorizontalScreen) ? document.body : '';
});
</script>

<style lang="scss">
.c-mobile-chat-room-pendant {
  position: absolute;
  right: 16px;
  bottom: 5px;
  width: 40px;
}

.c-mobile-chat-room-pendant__item + .c-mobile-chat-room-pendant__item {
  margin-top: 12px;
}

.c-mobile-chat-room-pendant--page-fullscreen {
  position: fixed;
  right: initial;
  bottom: 80px;
  left: 32px;
  z-index: $--zIndex-pendant;
  transform: rotate(90deg);
  transform-origin: bottom left;
}
.c-mobile-chat-room-pendant--screen__horizontal {
  position: fixed;
  right: 30px;
  bottom: 40px;
  left: unset;
  z-index: $--zIndex-pendant;
  transform: rotate(0deg);
  transform-origin: bottom right;
}
</style>
