<template>
  <div class="c-mobile-iar-render-v2">
    <!-- 中奖领取弹层 -->
    <mobile-lottery-receive-popup />

    <!-- 平台抽奖活动列表 -->
    <mobile-lucky-lottery-list-popup />

    <!-- 平台抽奖活动详情 -->
    <mobile-lucky-lottery-detail-popup />

    <!-- 平台抽奖中奖领取弹层 -->
    <mobile-lucky-lottery-receive-popup />
  </div>
</template>

<script setup lang="ts">
import MobileLotteryReceivePopup from './lottery-v2/mobile-lottery-receive-popup.vue';
import MobileLuckyLotteryListPopup from './lucky-lottery/mobile-lucky-lottery-list-popup.vue';
import MobileLuckyLotteryDetailPopup from './lucky-lottery/mobile-lucky-lottery-detail-popup.vue';
import MobileLuckyLotteryReceivePopup from './lucky-lottery/mobile-lucky-lottery-receive-popup.vue';
</script>
