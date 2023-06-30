<!-- @file 竖屏端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-portrait-iar-render">
    <!-- 快速答题卡 -->
    <div class="c-portrait-iar-render__quick-answer-card">
      <portrait-quick-answer-card />
    </div>
    <!-- 公告 -->
    <portrait-announcement-popup v-if="announcementFunctionVisible" />
    <!-- 答题卡 -->
    <portrait-answer-card-popup />
    <!-- 签到 -->
    <portrait-check-in-popup />
    <!-- 反馈 -->
    <portrait-feed-back-popup v-if="interactSetting.watchFeedbackEnabled" />
    <!-- 抽奖动画 -->
    <portrait-lottery-animation />
    <!-- 抽奖结果弹层 -->
    <portrait-lottery-result-popup />
    <!-- 中奖记录弹层 -->
    <portrait-lottery-record-popup />
    <!-- 商品库弹层 -->
    <portrait-product-list-popup />
    <!-- 问卷 -->
    <portrait-questionnaire-popup />
    <!-- 红包弹窗 -->
    <portrait-redpack-popup />
    <!-- 红包雨组件 -->
    <portrait-redpack-rain />
    <!-- 积分红包记录弹层 -->
    <portrait-score-record-popup v-if="scoreRedpackEnabled" />
    <!-- 报名抽奖 -->
    <portrait-enroll-lottery-popup />
    <!-- 问答 -->
    <portrait-question-answer v-if="qaMenuData.visible" />
    <!-- 商品库职位详情弹层 -->
    <portrait-product-job-detail-popup />
  </div>
</template>

<script setup lang="ts">
import PortraitAnnouncementPopup from './announcement/mobile-announcement-popup.vue';
import PortraitAnswerCardPopup from './answer-card/mobile-answer-card-popup.vue';
import PortraitQuickAnswerCard from './answer-card/mobile-quick-answer-card.vue';
import PortraitCheckInPopup from './check-in/portrait-check-in-popup.vue';
import PortraitFeedBackPopup from './feed-back/mobile-feed-back-popup.vue';
import PortraitLotteryAnimation from './lottery/mobile-lottery-animation.vue';
import PortraitLotteryResultPopup from './lottery/mobile-lottery-result-popup.vue';
import PortraitLotteryRecordPopup from './lottery/mobile-lottery-record-popup.vue';
import PortraitProductListPopup from './product/portrait-product-list-popup.vue';
import PortraitQuestionnairePopup from './questionnaire/mobile-questionnaire-popup.vue';
import PortraitRedpackPopup from './redpack/mobile-redpack-popup.vue';
import PortraitRedpackRain from './redpack-rain/mobile-redpack-rain.vue';
import PortraitScoreRecordPopup from './score/mobile-score-record-popup.vue';
import PortraitEnrollLotteryPopup from './enroll-lottery/mobile-enroll-lottery-popup.vue';
import PortraitQuestionAnswer from './question-answer/portrait-question-answer.vue';
import PortraitProductJobDetailPopup from './product/portrait-product-job-detail-popup.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useRedpackStore } from '@/store/use-redpack-store';

const { announcementFunctionVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);

const { scoreRedpackEnabled } = storeDefinitionToRefs(useRedpackStore);

const { qaMenuData } = storeDefinitionToRefs(useChannelMenuStore);
</script>

<style
  src="@/components/page-watch-common/interactive-receive/_style/cover-portrait-interact-receive.scss"
  lang="scss"
></style>
<style lang="scss">
.c-portrait-iar-render__quick-answer-card {
  position: absolute;
  top: 12px;
  left: 0;
  z-index: 99;

  width: 100%;

  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
</style>
