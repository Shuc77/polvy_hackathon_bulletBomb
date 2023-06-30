<!-- @file PC 端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-pc-iar-render">
    <!-- 公告 -->
    <pc-announcement-dialog v-if="announcementFunctionVisible" />
    <!-- 答题卡 -->
    <pc-answer-card-dialog />
    <!-- 快速答题卡 -->
    <pc-quick-answer-card-dialog />
    <!-- 签到 -->
    <pc-check-in-dialog />
    <!-- 反馈 -->
    <pc-feed-back-dialog v-if="interactSetting.watchFeedbackEnabled" />
    <!-- 抽奖动画 -->
    <pc-lottery-animation />
    <!-- 抽奖结果弹层 -->
    <pc-lottery-result-dialog />
    <!-- 问卷 -->
    <pc-questionnaire-dialog />
    <!-- 红包弹窗 -->
    <pc-redpack-dialog />
    <!-- 红包雨组件 -->
    <pc-redpack-rain />
    <!-- 报名抽奖 -->
    <pc-enroll-lottery-dialog />
    <!-- 商品库职位详情弹层 -->
    <pc-product-job-detail-dialog />
  </div>
</template>

<script setup lang="ts">
import PcAnnouncementDialog from './announcement/pc-announcement-dialog.vue';
import PcAnswerCardDialog from './answer-card/pc-answer-card-dialog.vue';
import PcQuickAnswerCardDialog from './answer-card/pc-quick-answer-card-dialog.vue';
import PcCheckInDialog from './check-in/pc-check-in-dialog.vue';
import PcFeedBackDialog from './feed-back/pc-feed-back-dialog.vue';
import PcLotteryAnimation from './lottery/pc-lottery-animation.vue';
import PcLotteryResultDialog from './lottery/pc-lottery-result-dialog.vue';
import PcQuestionnaireDialog from './questionnaire/pc-questionnaire-dialog.vue';
import PcRedpackDialog from './redpack/pc-redpack-dialog.vue';
import PcRedpackRain from './redpack-rain/pc-redpack-rain.vue';
import PcEnrollLotteryDialog from './enroll-lottery/pc-enroll-lottery-dialog.vue';
import PcProductJobDetailDialog from './product/pc-product-job-detail-dialog.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { announcementFunctionVisible, interactSetting } =
  storeDefinitionToRefs(useInteractReceiveStore);
</script>

<style lang="scss">
@import '@/components/page-watch-common/interactive-receive/_style/cover-pc-interact-receive.scss';
</style>
