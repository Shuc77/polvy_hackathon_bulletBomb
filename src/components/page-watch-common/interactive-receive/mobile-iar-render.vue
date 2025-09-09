<!-- @file 移动端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-mobile-iar-render">
    <!-- 公告 -->
    <mobile-announcement-popup v-if="announcementFunctionVisible" />

    <!-- 反馈 -->
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
    <!-- 云席相关提示弹窗 -->
    <mobile-seat-table-tips
      v-if="seatTableVisible && isMeetingSeatTableTemplate && seatTableMenuData.visible"
    />
    <!-- 二维码分弹窗 -->
    <mobile-qr-code-share-dialog />
    <!-- 优惠券弹窗 -->
    <mobile-coupon-common-popup />
    <!-- 优惠券已领取弹窗 -->
    <mobile-coupon-user-popup />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { $ } from '@just4/dom';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import MobileAnnouncementPopup from './announcement/mobile-announcement-popup.vue';
import MobileFeedbackPopup from './feedback/mobile-feedback-popup.vue';
import MobileLotteryAnimation from './lottery/mobile-lottery-animation.vue';
import MobileLotteryResultPopup from './lottery/mobile-lottery-result-popup.vue';
import MobileQuestionnairePopup from './questionnaire/mobile-questionnaire-popup.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import MobileSeatTableTips from './seat-table/seat-table-tips/mobile-seat-table-tips.vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';
import MobileCouponCommonPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-common-popup.vue';
import MobileCouponUserPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-user-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useRedpackStore } from '@/store/use-redpack-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const {
  isIarFullScreen,

  announcementFunctionVisible,
  seatTableVisible,
  isMeetingSeatTableTemplate,
  useV2Lottery,
  useV2Questionnaire,

  feedbackEnabled,
} = storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { seatTableMenuData } = storeDefinitionToRefs(useChannelMenuStore);

watch(
  () => isIarFullScreen.value,
  () => {
    if (isIarFullScreen.value) {
      $(document.documentElement).addClass('plv-mobile-watch-iar--fullscreen');
    } else {
      $(document.documentElement).removeClass('plv-mobile-watch-iar--fullscreen');
    }
  },
);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-mobile-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-mobile-interact-receive.scss'
  );
});
</script>
