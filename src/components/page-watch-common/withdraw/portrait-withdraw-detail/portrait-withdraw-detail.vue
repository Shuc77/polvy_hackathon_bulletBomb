<template>
  <mobile-popup
    :theme="PopupTheme.Portrait"
    class="c-portrait-withdraw-detail--popup"
    :title="$lang('withdraw.detail.popup.title')"
    :visible.sync="popupVisible"
    fill-body-section
    append-to-body
  >
    <div
      class="c-portrait-withdraw-detail"
      @scroll="debounceHandleDetailMainScroll"
    >
      <!-- 基本信息 -->
      <div class="c-portrait-withdraw-detail__info">
        <p class="c-portrait-withdraw-detail__info__balance">
          ￥<span>{{ totalAmount }}</span>
        </p>
        <normal-button
          class="c-portrait-withdraw-detail__info__btn"
          :type="ButtonType.Portrait"
          :size="ButtonSize.Small"
          block
          :text="$lang('withdraw.detail.btn.text')"
          @click="handleShowWithdrawApply"
        />
        <div class="c-portrait-withdraw-detail__amount">
          <p>
            {{ $lang('withdraw.redpack.receive.record') }}：￥
            <span>{{ totalReceive }}</span>
          </p>
          <p>
            {{ $lang('withdraw.cash.receive.record') }}：￥
            <span>{{ totalWithdraw }}</span>
          </p>
        </div>
      </div>
      <portrait-normal-tabs
        class="c-portrait-withdraw-detail__tabs"
        v-model="curTab"
        :tabs="detailTabs"
      />
      <section>
        <portrait-redpack-receive-record
          ref="redpackReceiveRecordRef"
          v-if="curTab === WithdrawDetailTab.RedpackReceiveRecord"
        />
        <portrait-cash-receive-record
          ref="cashReceiveRecordRef"
          v-if="curTab === WithdrawDetailTab.CashReceiveRecord"
        />
      </section>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

import { PopupTheme } from '@/components/common-base/popup/types';
import { ButtonType, ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PortraitNormalTabs from '@/components/common-base/tabs/portrait-normal-tabs/portrait-normal-tabs.vue';
import PortraitCashReceiveRecord from './portrait-cash-receive-record.vue';
import PortraitRedpackReceiveRecord from './portrait-redpack-receive-record.vue';

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
.c-portrait-withdraw-detail {
  height: 100%;
  overflow-y: scroll;
}

.c-portrait-withdraw-detail__info {
  padding-top: 14px;
  text-align: center;
  .c-portrait-withdraw-detail__info__balance {
    font-size: 20px;
    color: #fff;
    @include alibaba-font(20px, bold);
    span {
      font-size: 32px;
      font-weight: bold;
    }
  }
  .c-portrait-withdraw-detail__info__btn {
    display: inline-block;
    width: 96px;
    margin: 16px auto 20px;
    white-space: nowrap;
  }
  .c-portrait-withdraw-detail__amount {
    padding-bottom: 24px;
    font-size: 12px;
    text-align: center;
    p {
      display: inline-block;
      margin: 0 8px;
      color: #fff;
    }
    span {
      color: $--portrait-primary-color;
    }
  }
}

.c-portrait-withdraw-detail__tabs {
  position: sticky;
  top: 0;
}

// 子组件样式
.c-portrait-withdraw-detail__contents {
  &.c-portrait-withdraw-detail__contents--pb {
    @include iphone-x-pb(24px);
  }
  .c-portrait-withdraw-detail__contents__item {
    position: relative;
    padding: 11px 0;
    margin: 0 16px;
    color: #fff;
    border-bottom: 1px solid $--portrait-popper-border;
    .c-portrait-withdraw-detail__contents__item__title {
      margin-bottom: 2px;
      font-size: 14px;
      line-height: 20px;
    }
    .c-portrait-withdraw-detail__contents__item__date {
      font-size: 12px;
      color: #cdcdcd;
    }
    .c-portrait-withdraw-detail__contents__item__amount {
      position: absolute;
      top: 50%;
      right: 16px;
      color: $--portrait-primary-color;
      transform: translateY(-50%);
    }
  }
}
</style>
