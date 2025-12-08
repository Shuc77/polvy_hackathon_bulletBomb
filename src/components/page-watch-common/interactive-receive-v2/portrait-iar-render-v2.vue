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
    <questionnaire-dialog />

    <!-- 答题卡 -->
    <answer-card-dialog />

    <!-- 快速答题卡 -->
    <quick-answer-card />

    <!-- 投票列表弹层 -->
    <mobile-vote-list-popup />

    <!-- 投票规则说明弹层 -->
    <mobile-vote-rule-popup />
  </div>
</template>

<script setup lang="ts">
import AnswerCardDialog from './answer-card-v2/answer-card-dialog/answer-card-dialog.vue';
import QuickAnswerCard from './answer-card-v2/quick-answer-card/quick-answer-card.vue';
import PortraitCheckInPopup from './check-in-v2/portrait-check-in-popup.vue';
import MobileLotteryDialog from './lottery-v2/lottery-dialog/mobile-lottery-dialog.vue';
import MobileLuckyLotteryDetailPopup from './lucky-lottery/mobile-lucky-lottery-detail-popup.vue';
import MobileLuckyLotteryListPopup from './lucky-lottery/mobile-lucky-lottery-list-popup.vue';
import MobileLuckyLotteryReceivePopup from './lucky-lottery/mobile-lucky-lottery-receive-popup.vue';
import QuestionnaireDialog from './questionnaire-v2/questionnaire-dialog/questionnaire-dialog.vue';
import MobileVoteListPopup from './vote-v2/mobile-vote-list-popup.vue';
import MobileVoteRulePopup from './vote-v2/mobile-vote-rule-popup.vue';
</script>
