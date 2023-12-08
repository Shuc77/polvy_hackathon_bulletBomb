<!-- @file 移动端横屏-提现详情页 -->
<template>
  <mobile-popup
    class="c-mobile-withdraw-detail"
    :title="$lang('withdraw.detail.popup.title')"
    :visible.sync="popupVisible"
    fill-body-section
    append-to-body
  >
    <div class="c-mobile-withdraw-detail__container">
      <div
        class="c-mobile-withdraw-detail__main"
        @scroll="debounceHandleDetailMainScroll"
      >
        <div class="c-mobile-withdraw-detail__info">
          <p class="c-mobile-withdraw-detail__info__balance">
            ￥<span>{{ totalAmount }}</span>
          </p>
          <normal-button
            class="c-mobile-withdraw-detail__info__btn"
            :size="ButtonSize.Medium"
            block
            :text="$lang('withdraw.detail.btn.text')"
            @click="handleShowWithdrawApply"
          />
          <div class="c-mobile-withdraw-detail__info__amount-wrap">
            <p>
              {{ $lang('withdraw.redpack.receive.record') }}：￥
              <span class="c-mobile-withdraw-detail__info__amount pws-mobile-withdraw-highlight">{{
                totalReceive
              }}</span>
            </p>
            <p>
              {{ $lang('withdraw.cash.receive.record') }}：￥
              <span class="c-mobile-withdraw-detail__info__amount pws-mobile-withdraw-highlight">{{
                totalWithdraw
              }}</span>
            </p>
          </div>
        </div>

        <div class="c-mobile-withdraw-detail__table">
          <!-- 先不将 tabs 抽成组件，目前只用作简单的切换 -->
          <ul class="c-mobile-withdraw-detail__tabs">
            <li
              v-for="(tab, index) in detailTabs"
              class="c-mobile-withdraw-detail__tab"
              :class="{
                'c-mobile-withdraw-detail__tab--active pws-mobile-withdraw-tab--active':
                  tab.value === curTab,
              }"
              :key="index"
              @click="curTab = tab.value"
            >
              {{ tab.label }}
            </li>
          </ul>
          <div class="c-mobile-withdraw-detail__panel-wrap">
            <mobile-redpack-receive-record
              ref="redpackReceiveRecordRef"
              v-if="curTab === WithdrawDetailTab.RedpackReceiveRecord"
            />
            <mobile-cash-receive-record
              ref="cashReceiveRecordRef"
              v-if="curTab === WithdrawDetailTab.CashReceiveRecord"
            />
          </div>
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import MobileRedpackReceiveRecord from './mobile-redpack-receive-record.vue';
import MobileCashReceiveRecord from './mobile-cash-receive-record.vue';

import { appEvents, eventBus } from '@/app/app-events';
import { WithdrawDetailTab, useWithdrawDetailHook } from '../_hooks/use-withdraw-detail';

const {
  totalAmount,
  totalReceive,
  totalWithdraw,
  curTab,
  detailTabs,

  initWithdrawDetail,
  resetWithdrawDetail,

  redpackReceiveRecordRef,
  cashReceiveRecordRef,
  debounceHandleDetailMainScroll,
} = useWithdrawDetailHook();

const popupVisible = ref(false);

onMounted(() => {
  eventBus.$on(appEvents.withdraw.OpenWithdrawDetail, handleWithdrawDetailPopupVisible);
});

onBeforeUnmount(() => {
  eventBus.$off(appEvents.withdraw.OpenWithdrawDetail, handleWithdrawDetailPopupVisible);
});

/** "提现详情" OpenWithdrawDetail 事件钩子 */
function handleWithdrawDetailPopupVisible(visible: boolean) {
  if (visible) {
    initWithdrawDetail();
  } else {
    resetWithdrawDetail();
  }
  popupVisible.value = visible;
}

/** 展示提现申请 */
function handleShowWithdrawApply() {
  eventBus.$emit(appEvents.withdraw.OpenWithdrawApply, true);
}
</script>

<style lang="scss">
.c-mobile-withdraw-detail__info {
  text-align: center;
}
.c-mobile-withdraw-detail__info__balance {
  padding-top: 20px;
  font-size: 20px;
  color: #333;
  @include alibaba-font(20px, bold);
  span {
    font-size: 32px;
    font-weight: bold;
  }
}
.c-mobile-withdraw-detail__info__btn {
  display: block;
  width: auto;
  min-width: 96px;
  height: 32px;
  margin: 21px auto;
  line-height: 32px;
}
.c-mobile-withdraw-detail__info__amount-wrap {
  padding: 21px 0;
  font-size: 12px;
  color: #666;
  p {
    display: inline-block;
    margin: 0;
    &:last-child {
      margin-left: 16px;
    }
    .c-mobile-withdraw-detail__info__amount {
      line-height: 18px;
      color: #3082fe;
    }
  }
}
.c-mobile-withdraw-detail__tabs {
  position: sticky;
  top: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 43px;
  font-size: 14px;
  line-height: 43px;
  color: #666;
  background: #ffffff;
  border: 1px solid #ededef;
  border-right: none;
  border-left: none;
}
.c-mobile-withdraw-detail__tab {
  height: 43px;
  margin: 0 20px;
  &::after {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    content: '';
    background-color: #3082fe;
    border-radius: 1px;
    opacity: 0;
  }
  &--active {
    position: relative;
    color: #3082fe;
    &::after {
      opacity: 1;
      transition: all 0.3s ease-in;
    }
  }
}
.c-mobile-withdraw-detail__container {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
}
.c-mobile-withdraw-detail__main {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
}
</style>
