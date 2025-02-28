<template>
  <pc-dialog
    class="c-pc-personal-reward-popup"
    :title="$lang('personalReward.myReward')"
    :visible.sync="visible"
  >
    <div class="c-pc-personal-reward-popup__content">
      <!-- <div class="c-pc-personal-reward-popup__switch">
        <span
          v-for="(item, index) in rewardTypes"
          :key="index"
          :class="{
            'is-active': item.type === currentType,
          }"
          @click="currentType = item.type"
        >
          {{ item.text }}
        </span>
      </div> -->

      <div class="c-pc-personal-reward-popup__inner">
        <pc-task-reward-list v-if="currentType === 'task-activity'" />
        <pc-lottery-record-list v-show="currentType === 'lottery'" />
      </div>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import PcLotteryRecordList from '../interactive-receive-v2/lottery-v2/pc-lottery-record-list.vue';
import PcTaskRewardList from '../task-activity/pc-task-reward-list.vue';
import { usePersonalReward } from './use-personal-reward';

const { visible, currentType } = usePersonalReward();
</script>

<style lang="scss">
.c-pc-personal-reward-popup {
  .c-pc-dialog__header {
    border-color: rgba(#000000, 0.04);
  }
  .c-pc-dialog__content {
    overflow: hidden;
    background: linear-gradient(144deg, #f2d1ef 0%, #fdf2df 100%);
    &::before {
      position: absolute;
      top: 0;
      right: -7px;
      z-index: 1;
      width: 216px;
      height: 113px;
      pointer-events: none;
      content: '';
      background: linear-gradient(254deg, #ef8767 -8%, #f9dec5 57%);
      filter: blur(70px);
      border-radius: 50%;
    }
  }

  .c-mobile-popup__body {
    z-index: 2;
  }
}

.c-pc-personal-reward-popup__content {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.c-pc-personal-reward-popup__switch {
  display: flex;
  align-items: center;
  padding: 16px 24px 0;

  span {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    height: 24px;
    padding: 0 8px;
    margin-right: 12px;
    font-size: 12px;
    color: #666666;
    cursor: pointer;
    background: #fff8f8;
    border: 1px solid #fff8f8;
    border-radius: 12px;

    &.is-active {
      color: #fe3f52;
      border-color: #fe3f52;
    }
  }
}

.c-pc-personal-reward-popup__inner {
  flex: 1;
  margin-top: 14px;
  overflow: hidden;
}
</style>
