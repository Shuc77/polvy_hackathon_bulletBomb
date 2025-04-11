<!-- @file 竖屏端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-portrait-iar-render">
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
    <!-- 反馈 -->
    <mobile-feed-back-popup v-if="interactSetting.watchFeedbackEnabled" />

    <template v-if="!useV2Lottery">
      <!-- 抽奖动画 -->
      <mobile-lottery-animation />
      <!-- 抽奖结果弹层 -->
      <mobile-lottery-result-popup />
    </template>

    <!-- 商品库弹层 -->
    <portrait-product-list-popup v-if="interactSetting.productEnabled" />
    <!-- 商品详情弹层，不跟随商品库开关，因为大小卡片可以唤起详情 -->
    <portrait-product-detail-popup />
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
    <!-- 问答 -->
    <portrait-question-answer v-if="qaMenuData.visible" />
    <!-- 商品库职位详情弹层，不跟随商品库开关，因为大小卡片可以唤起详情 -->
    <portrait-product-job-detail-popup />
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
import { onMounted } from 'vue';
import MobileAnnouncementPopup from './announcement/mobile-announcement-popup.vue';
import MobileAnswerCardPopup from './answer-card/mobile-answer-card-popup.vue';
import MobileQuickAnswerCard from './answer-card/mobile-quick-answer-card.vue';
import PortraitCheckInPopup from '../interactive-receive-v2/check-in-v2/portrait-check-in-popup.vue';
import MobileFeedBackPopup from './feed-back/mobile-feed-back-popup.vue';
import MobileLotteryAnimation from './lottery/mobile-lottery-animation.vue';
import MobileLotteryResultPopup from './lottery/mobile-lottery-result-popup.vue';
import PortraitProductListPopup from './product/portrait-product-list-popup.vue';
import PortraitProductDetailPopup from './product/portrait-product-detail-popup.vue';
import MobileQuestionnairePopup from './questionnaire/mobile-questionnaire-popup.vue';
import MobileRedpackPopup from './redpack/mobile-redpack-popup.vue';
import MobileRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import MobileScoreRecordPopup from './score/mobile-score-record-popup.vue';
import MobileEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import MobileOrderPopup from './order/mobile-order-popup.vue';
import MobileOrderCenterPopup from './order/mobile-order-center-popup.vue';
import PortraitQuestionAnswer from './question-answer/portrait-question-answer.vue';
import PortraitProductJobDetailPopup from './product/portrait-product-job-detail-popup.vue';
import MobileQrCodeShareDialog from '../../common-business/qrcode-share-dialog/mobile-qrcode-share-dialog.vue';
import MobileCouponCommonPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-common-popup.vue';
import MobileCouponUserPopup from '@/components/page-watch-common/interactive-receive-v2/coupon-v2/mobile-coupon-user-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useRedpackStore } from '@/store/use-redpack-store';

const { announcementFunctionVisible, interactSetting, useV2Lottery } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-portrait-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-portrait-interact-receive.scss'
  );
});
</script>
