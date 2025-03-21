<!-- @file 移动端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-mobile-iar-render">
    <!-- 公告 -->
    <mobile-announcement-popup v-if="announcementFunctionVisible" />
    <!-- 答题卡 -->
    <mobile-answer-card-popup />
    <!-- 签到 -->
    <mobile-check-in-popup />
    <!-- 反馈 -->
    <mobile-feed-back-popup v-if="interactSetting.watchFeedbackEnabled" />
    <!-- 抽奖动画 -->
    <mobile-lottery-animation />
    <!-- 抽奖结果弹层 -->
    <mobile-lottery-result-popup />
    <!-- 问卷 -->
    <mobile-questionnaire-popup />
    <!-- 红包弹窗 -->
    <mobile-redpack-popup />
    <!-- 红包雨组件 -->
    <mobile-redpack-rain />
    <!-- 积分红包记录弹层 -->
    <mobile-score-record-popup v-if="scoreRedpackEnabled" />
    <!-- 报名抽奖 -->
    <mobile-enroll-lottery-popup />
    <!-- 商品库弹层 -->
    <portrait-product-list-popup v-if="interactSetting.productEnabled" />
    <!-- 商品库职位详情弹层 -->
    <mobile-product-job-detail-popup />
    <!-- 云席相关提示弹窗 -->
    <mobile-seat-table-tips
      v-if="seatTableVisible && isMeetingSeatTableTemplate && seatTableMenuData.visible"
    />
    <!-- 下单弹窗 -->
    <mobile-order-popup />
    <!-- 二维码分弹窗 -->
    <mobile-qr-code-share-dialog />
    <!-- 订单中心弹窗 -->
    <mobile-order-center-popup />
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
import MobileAnswerCardPopup from './answer-card/mobile-answer-card-popup.vue';
import MobileCheckInPopup from '../interactive-receive-v2/check-in-v2/mobile-check-in-popup.vue';
import MobileFeedBackPopup from './feed-back/mobile-feed-back-popup.vue';
import MobileLotteryAnimation from './lottery/mobile-lottery-animation.vue';
import MobileLotteryResultPopup from './lottery/mobile-lottery-result-popup.vue';
import MobileQuestionnairePopup from './questionnaire/mobile-questionnaire-popup.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import MobileProductJobDetailPopup from './product/mobile-product-job-detail-popup.vue';
import MobileSeatTableTips from './seat-table/seat-table-tips/mobile-seat-table-tips.vue';
import MobileOrderPopup from './order/mobile-order-popup.vue';
import MobileOrderCenterPopup from './order/mobile-order-center-popup.vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';
import PortraitProductListPopup from './product/portrait-product-list-popup.vue';
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
  interactSetting,
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
