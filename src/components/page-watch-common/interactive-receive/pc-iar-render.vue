<!-- @file PC 端互动功能接收端弹窗组件渲染入口 -->
<template>
  <div class="c-pc-iar-render">
    <template>
      <!-- 公告 -->
      <pc-announcement-dialog v-if="announcementFunctionVisible" />
      <!-- 签到 -->
      <pc-check-in-dialog />
      <!-- 反馈 -->
      <pc-feedback-dialog v-if="feedbackEnabled" />

      <template v-if="!useV2Lottery">
        <!-- 抽奖动画 -->
        <pc-lottery-animation />
        <!-- 抽奖结果弹层 -->
        <pc-lottery-result-dialog />
      </template>

      <!-- 问卷 -->
      <pc-questionnaire-dialog v-if="!useV2Questionnaire" />
      <!-- 红包弹窗 -->
      <pc-redpack-dialog />
      <!-- 红包雨组件 -->
      <pc-redpack-rain />
      <!-- 报名抽奖 -->
      <pc-enroll-lottery-dialog />
      <!-- 二维码分弹窗 -->
      <pc-qr-code-share-dialog />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import PcAnnouncementDialog from './announcement/pc-announcement-dialog.vue';
import PcCheckInDialog from '../interactive-receive-v2/check-in-v2/pc-check-in-dialog.vue';
import PcFeedbackDialog from './feedback/pc-feedback-dialog.vue';
import PcLotteryAnimation from './lottery/pc-lottery-animation.vue';
import PcLotteryResultDialog from './lottery/pc-lottery-result-dialog.vue';
import PcQuestionnaireDialog from './questionnaire/pc-questionnaire-dialog.vue';
import PcRedpackDialog from './redpack/pc-redpack-dialog.vue';
import PcRedpackRain from './redpack-rain/pc-redpack-rain.vue';
import PcEnrollLotteryDialog from './enroll-lottery/pc-enroll-lottery-dialog.vue';
import PcQrCodeShareDialog from '../../common-business/qrcode-share-dialog/pc-qrcode-share-dialog.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const { announcementFunctionVisible, feedbackEnabled, useV2Lottery, useV2Questionnaire } =
  storeDefinitionToRefs(useInteractReceiveStore);

onMounted(() => {
  import(
    /* webpackChunkName: "cover-pc-interact-receive" */ '@/components/page-watch-common/interactive-receive/_style/cover-pc-interact-receive.scss'
  );
});
</script>
