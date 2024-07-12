<!-- 移动端任务活动 -->
<template>
  <mobile-popup
    class="c-mobile-task-reward-popup"
    content-class="c-mobile-task-reward-popup__body"
    :visible.sync="visible"
    fill-body-section
    :mask-opacity="0"
    :closable="false"
    @body-scroll-near-bottom="scrollNearBottom"
  >
    <template #title>
      <div
        class="c-mobile-task-reward-popup__back"
        @click="close"
      >
        <mobile-icon-close
          v-if="showClose"
          class="c-mobile-task-reward-popup__back__icon"
        />
        <mobile-icon-arrow-left
          v-else
          class="c-mobile-task-reward-popup__back__icon"
        />
      </div>
      <div class="c-mobile-task-reward-popup__header">
        <img
          v-if="currentLang === LangType.Chinese"
          src="./images/mobile-reward-title-cn.png"
        />
        <img
          v-else
          src="./images/mobile-reward-title-en.png"
        />
      </div>
    </template>
    <div class="c-mobile-task-reward-popup__list">
      <div
        v-for="(item, index) in rewardList"
        :key="index"
        class="c-mobile-task-reward-popup__item"
      >
        <div class="c-mobile-task-reward-popup__item__title">
          {{ $lang('taskActivity.rewardGeted', { content: getTaskRewardText(item.taskReward) }) }}
        </div>
        <div class="c-mobile-task-reward-popup__item__desc">
          {{
            $lang('taskActivity.rewardGetCondition', { content: getTaskReachText(item.taskReach) })
          }}
        </div>
        <div class="c-mobile-task-reward-popup__item__desc">
          {{
            $lang('taskActivity.rewardGetTime', {
              content: formatDate(item.finishTime, DATE_FORMAT_COMPLETE),
            })
          }}
        </div>
        <div
          v-if="item.taskReward.type === TaskActivityRewardType.Cash"
          class="c-mobile-task-reward-popup__item__status"
          :class="['c-mobile-task-reward-popup__item__status--' + item.rewardStatus]"
        >
          {{ getRewardStatusText(item.rewardStatus) }}
        </div>
        <div
          v-if="item.taskReward.type === TaskActivityRewardType.Cash && item.rewardStatus === TaskRewardStatus.NotIssued"
          class="c-mobile-task-reward-popup__item__reward-desc"
        >
          {{ $lang('taskActivity.rewardDesc') }}
        </div>
      </div>

      <div
        v-if="rewardList.length === 0"
        class="c-mobile-task-reward-popup__empty"
      >
        {{ $lang('taskActivity.emptyReward') }}
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { useTaskReward, getTaskRewardText, getTaskReachText } from './use-task-activity';
import { formatDate } from '@polyv/utils/es/date';
import { MobileIconArrowLeft, MobileIconClose } from '@/components/component-icons/mobile/map';
import { DATE_FORMAT_COMPLETE } from '@/assets/constants/date-format';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';
import { TaskActivityRewardType, TaskRewardStatus } from '@polyv/live-watch-sdk';

const { visible, rewardList, getRewardStatusText, close, scrollNearBottom, showClose } =
  useTaskReward();

const { currentLang } = storeDefinitionToRefs(useLangStore);
</script>

<style lang="scss">
.c-mobile-task-reward-popup {
  .c-mobile-popup__header {
    border-bottom: none;
  }
}

.c-mobile-task-reward-popup__back {
  position: absolute;
  top: 50%;
  left: 12px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 20px;
  color: #fff;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transform: translateY(-50%);
}
.c-mobile-task-reward-popup__back__icon {
  display: flex;
}

.c-mobile-task-reward-popup__body {
  overflow: hidden;
  background: linear-gradient(144deg, #f2d1ef 0%, #fdf2df 100%);
  &::before {
    position: absolute;
    top: 0;
    right: -7px;
    width: 216px;
    height: 113px;
    content: '';
    background: linear-gradient(254deg, #ef8767 -8%, #f9dec5 57%);
    filter: blur(70px);
    border-radius: 50%;
  }

  .c-mobile-popup__header {
    height: 66px;
  }
  .c-mobile-popup__header__title {
    position: relative;
    height: 66px;
    line-height: 66px;
  }
}

.c-mobile-task-reward-popup__header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    height: 20px;
    margin-right: 12px;
    margin-left: 12px;
  }

  &::before,
  &::after {
    width: 15px;
    height: 11px;
    content: '';
    background-position: center;
    background-size: cover;
  }

  &::before {
    background-image: url(./images/mobile-title-left.png);
  }
  &::after {
    background-image: url(./images/mobile-title-right.png);
  }
}

.c-mobile-task-reward-popup__list {
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  padding: 0 12px 12px;
}
.c-mobile-task-reward-popup__item {
  position: relative;
  z-index: 10;
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 12px;
}
.c-mobile-task-reward-popup__item__title {
  padding-right: 60px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  line-height: 19px;
  color: #333a47;
}
.c-mobile-task-reward-popup__item__desc {
  font-size: 12px;
  line-height: 17px;
  color: #9aa4b3;

  & + & {
    margin-top: 4px;
  }
}
.c-mobile-task-reward-popup__item__status {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 12px;
  line-height: 17px;

  &.c-mobile-task-reward-popup__item__status--0,
  &.c-mobile-task-reward-popup__item__status--2,
  &.c-mobile-task-reward-popup__item__status--3,
  &.c-mobile-task-reward-popup__item__status---1 {
    color: #3f76fc;
  }

  &.c-mobile-task-reward-popup__item__status--1 {
    color: #9aa4b3;
  }

  &.c-mobile-task-reward-popup__item__status--3 {
    color: #fe3f52;
  }
}
.c-mobile-task-reward-popup__item__reward-desc {
  position: absolute;
  top: 37px;
  right: 18px;
  font-size: 12px;
  line-height: 17px;
  color: #9aa4b3;
}
.c-mobile-task-reward-popup__empty {
  position: absolute;
  top: 0;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 17px;
  color: #999999;
  background: #fff;
  border-radius: 12px;
  &::before {
    width: 65px;
    height: 65px;
    margin-bottom: 12px;
    content: '';
    background-image: url(./images/empty-reward.png);
    background-size: contain;
  }
}
</style>
