<template>
  <div class="c-portrait-iar-render-v2">
    <!-- 平台抽奖活动列表 -->
    <mobile-lucky-lottery-list-popup />

    <!-- 平台抽奖活动详情 -->
    <mobile-lucky-lottery-detail-popup />

    <!-- 平台抽奖中奖领取弹层 -->
    <mobile-lucky-lottery-receive-popup />

    <!-- 抽奖弹层 -->
    <mobile-lottery-dialog />
  </div>
</template>

<script setup lang="ts">
import MobileLuckyLotteryListPopup from './lucky-lottery/mobile-lucky-lottery-list-popup.vue';
import MobileLuckyLotteryDetailPopup from './lucky-lottery/mobile-lucky-lottery-detail-popup.vue';
import MobileLuckyLotteryReceivePopup from './lucky-lottery/mobile-lucky-lottery-receive-popup.vue';
import MobileLotteryDialog from '@/components/page-watch-common/interactive-receive-v2/lottery-v2/lottery-dialog/mobile-lottery-dialog.vue';
</script>
