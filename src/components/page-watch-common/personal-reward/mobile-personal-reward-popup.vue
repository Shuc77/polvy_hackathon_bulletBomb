<template>
  <mobile-popup
    class="c-mobile-personal-reward-popup"
    content-class="c-mobile-personal-reward-popup__body"
    :visible.sync="visible"
    fill-body-section
    :closable="false"
    :mask-opacity="0"
  >
    <template #title>
      <div
        class="c-mobile-personal-reward-popup__back"
        @click="close"
      >
        <mobile-icon-close class="c-mobile-personal-reward-popup__back__icon" />
      </div>
      <div class="c-mobile-personal-reward-popup__header">
        <img
          v-if="currentLang === LangType.ZH_CN"
          src="./images/mobile-reward-title-cn.png"
        />
        <img
          v-else
          src="./images/mobile-reward-title-en.png"
        />
      </div>
    </template>

    <div class="c-mobile-personal-reward-popup__content">
      <div class="c-mobile-personal-reward-popup__switch">
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

        <div
          v-if="withdrawVisible && weixinPayType === WeixinPayType.TransferBill"
          class="c-mobile-personal-reward-popup__switch__withdraw"
          @click="openWithdraw"
        >
          <span>{{ $lang('personalReward.withdraw') }}</span>
          <mobile-icon-arrow-right class="c-mobile-personal-reward-popup__switch__withdraw__icon" />
        </div>
      </div>

      <div class="c-mobile-personal-reward-popup__inner">
        <mobile-task-reward-list v-if="currentType === 'task-activity'" />
        <mobile-lottery-record-list v-show="currentType === 'lottery'" />
        <mobile-lucky-lottery-prize-list v-if="currentType === 'lucky-lottery'" />
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { LangType } from '@/assets/lang/lang-enum';
import MobilePopup from '@/components/common-base/popup';
import { MobileIconClose, MobileIconArrowRight } from '@/components/component-icons/mobile/map';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import MobileLotteryRecordList from '../interactive-receive-v2/lottery-v2/mobile-lottery-record-list.vue';
import MobileTaskRewardList from '../task-activity/mobile-task-reward-list.vue';
import MobileLuckyLotteryPrizeList from '../interactive-receive-v2/lucky-lottery/mobile-lucky-lottery-prize-list.vue';
import { usePersonalReward } from './use-personal-reward';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWeixinStore } from '@/store/use-weixin-store';
import { WeixinPayType } from '@polyv/live-watch-sdk';

const { getEmitter } = useGlobalInject();

const { visible, close, rewardTypes, currentType } = usePersonalReward();

const { currentLang } = storeDefinitionToRefs(useLangStore);

const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

const { weixinPayType } = storeDefinitionToRefs(useWeixinStore);

function openWithdraw() {
  getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, true);
}
</script>

<style lang="scss">
.c-mobile-personal-reward-popup__body {
  overflow: hidden;
  background: linear-gradient(144deg, #f2d1ef 0%, #fdf2df 100%);
  &::before {
    position: absolute;
    top: 0;
    right: -7px;
    z-index: 1;
    width: 216px;
    height: 113px;
    content: '';
    background: linear-gradient(254deg, #ef8767 -8%, #f9dec5 57%);
    filter: blur(70px);
    border-radius: 50%;
  }
  .c-mobile-popup__body {
    z-index: 2;
  }

  .c-mobile-popup__header {
    height: 66px;
    border-bottom: none;
  }
  .c-mobile-popup__header__title {
    position: relative;
    height: 66px;
    line-height: 66px;
  }
}

.c-mobile-personal-reward-popup__back {
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
.c-mobile-personal-reward-popup__back__icon {
  display: flex;
}

.c-mobile-personal-reward-popup__header {
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

.c-mobile-personal-reward-popup__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-mobile-personal-reward-popup__switch {
  display: flex;
  align-items: center;
  padding: 0 12px;
  margin-bottom: 12px;

  & > span {
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
    background: #fff8f8;
    border: 1px solid #fff8f8;
    border-radius: 12px;

    &.is-active {
      color: #fe3f52;
      border-color: #fe3f52;
    }
  }
}

.c-mobile-personal-reward-popup__switch__withdraw {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 12px;
  font-weight: bold;
  color: #8e1e33;
}
.c-mobile-personal-reward-popup__switch__withdraw__icon {
  display: flex;
}

.c-mobile-personal-reward-popup__inner {
  flex: 1;
  overflow: hidden;
}
</style>
