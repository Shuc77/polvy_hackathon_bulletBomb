<template>
  <div class="c-portrait-iar-render-v2">
    <!-- 签到 -->
    <portrait-check-in-popup />

    <!-- 平台抽奖活动列表 -->
    <mobile-lucky-lottery-list-popup />

    <!-- 平台抽奖活动详情 -->
    <mobile-lucky-lottery-detail-popup />

    <!-- 平台抽奖中奖领取弹层 -->
    <mobile-lucky-lottery-receive-popup />

    <!-- 抽奖弹层 -->
    <mobile-lottery-dialog />

    <!-- 问卷 -->
    <questionnaire-dialog v-if="useV2Questionnaire" />

    <!-- 答题卡 -->
    <answer-card-dialog />

    <!-- 快速答题卡 -->
    <quick-answer-card />
  </div>
</template>

<script setup lang="ts">
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import PortraitCheckInPopup from './check-in-v2/portrait-check-in-popup.vue';
import MobileLuckyLotteryListPopup from './lucky-lottery/mobile-lucky-lottery-list-popup.vue';
import MobileLuckyLotteryDetailPopup from './lucky-lottery/mobile-lucky-lottery-detail-popup.vue';
import MobileLuckyLotteryReceivePopup from './lucky-lottery/mobile-lucky-lottery-receive-popup.vue';
import MobileLotteryDialog from './lottery-v2/lottery-dialog/mobile-lottery-dialog.vue';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';
import AnswerCardDialog from './answer-card-v2/answer-card-dialog/answer-card-dialog.vue';
import QuickAnswerCard from './answer-card-v2/quick-answer-card/quick-answer-card.vue';

const { useV2Questionnaire } = storeDefinitionToRefs(useInteractReceiveStore);
</script>
