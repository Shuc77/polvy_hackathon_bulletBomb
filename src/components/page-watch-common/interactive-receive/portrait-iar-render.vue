<!-- @file 竖屏端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-portrait-iar-render">
    <template v-if="isPlaybackWatchUrl">
      <!-- 举报/投诉反馈 -->
      <mobile-feedback-popup v-if="feedbackEnabled" />
    </template>
    <template v-else>
      <!-- 快速答题卡 -->
      <div class="c-portrait-iar-render__quick-answer-card">
        <mobile-quick-answer-card />
      </div>
      <!-- 公告 -->
      <mobile-announcement-popup v-if="announcementFunctionVisible" />
      <!-- 答题卡 -->
      <mobile-answer-card-popup />
      <!-- 签到 -->
      <portrait-check-in-popup />
      <!--  举报/投诉反馈 -->
      <mobile-feedback-popup v-if="feedbackEnabled" />

      <template v-if="!useV2Lottery">
        <!-- 抽奖动画 -->
        <mobile-lottery-animation />
        <!-- 抽奖结果弹层 -->
        <mobile-lottery-result-popup />
      </template>

      <!-- 问卷 -->
      <mobile-questionnaire-popup v-if="!useV2Questionnaire" />
      <!-- 红包弹窗 -->
      <mobile-redpack-popup />
      <!-- 红包雨组件 -->
      <mobile-redpack-rain />
      <!-- 积分红包记录弹层 -->
      <mobile-score-record-popup v-if="scoreRedpackEnabled" />
      <!-- 报名抽奖 -->
      <mobile-enroll-lottery-popup />
      <!-- 问答 -->
      <portrait-question-answer v-if="qaMenuData.visible" />
      <!-- 二维码分弹窗 -->
      <mobile-qr-code-share-dialog />
      <!-- 优惠券弹窗 -->
      <mobile-coupon-common-popup />
      <!-- 优惠券已领取弹窗 -->
      <mobile-coupon-user-popup />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import MobileAnnouncementPopup from './announcement/mobile-announcement-popup.vue';
import MobileAnswerCardPopup from './answer-card/mobile-answer-card-popup.vue';
import MobileQuickAnswerCard from './answer-card/mobile-quick-answer-card.vue';
import PortraitCheckInPopup from '../interactive-receive-v2/check-in-v2/portrait-check-in-popup.vue';
import MobileFeedbackPopup from './feedback/mobile-feedback-popup.vue';
import MobileLotteryAnimation from './lottery/mobile-lottery-animation.vue';
import MobileLotteryResultPopup from './lottery/mobile-lottery-result-popup.vue';
import MobileQuestionnairePopup from './questionnaire/mobile-questionnaire-popup.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import PortraitQuestionAnswer from './question-answer/portrait-question-answer.vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';
import MobileCouponCommonPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-common-popup.vue';
import MobileCouponUserPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-user-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const {
  announcementFunctionVisible,
  useV2Lottery,

  feedbackEnabled,
  useV2Questionnaire,
} = storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-portrait-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-portrait-interact-receive.scss'
  );
});
</script>
