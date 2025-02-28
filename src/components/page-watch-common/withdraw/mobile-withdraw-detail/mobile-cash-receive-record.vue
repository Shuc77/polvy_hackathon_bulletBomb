<!-- @file 移动端横屏-提现详情-提现记录 -->
<template>
  <ul class="c-mobile-cash-receive-record">
    <li
      class="c-mobile-cash-receive-record__item"
      v-for="record in receiveRecordList"
      :key="record.withdrawId"
    >
      <div>
        <p class="c-mobile-cash-receive-record__item-type">
          {{ getWithdrawStatusText(record.status) }}
          <span
            v-if="record.status === WithdrawStatus.WaitUserConfirm && record.confirmSignData"
            @click="requestMerchantTransfer(record.confirmSignData)"
          >
            {{ $lang('withdraw.cash.receive.record.toConfirm') }}
          </span>
        </p>
        <p class="c-mobile-cash-receive-record__item-date">
          {{ convertReceiveDate(record.applyTime) }}
        </p>
      </div>
      <p class="c-mobile-cash-receive-record__item-amount pws-mobile-withdraw-highlight">
        -{{ convertAmount(record.amount) }}
      </p>
    </li>
    <li
      v-show="loadingVisible"
      class="c-mobile-cash-receive-record__item--loading"
    >
      <list-loading />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import listLoading from '@/components/common-base/list-loading/list-loading.vue';

import { WithdrawStatus } from '@polyv/live-watch-sdk';
import { useReceiveRecordHook, getWithdrawStatusText } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';
import { useWeixinMerchantTransfer } from '@/hooks/platform/use-weixin/use-weixin-merchant-transfer';

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const {
  loadingVisible,
  receiveRecordList,

  convertReceiveDate,
  convertAmount,
  getReceiveRecordList,
  refreshList,
} = useReceiveRecordHook({
  fetchMethod: params => watchCore.withdraw.getWithdrawRecord(params),
  errMsg: translate('withdraw.cash.receive.history.error'),
});

const { requestMerchantTransfer } = useWeixinMerchantTransfer({
  successCb: () => refreshList(),
  cancelCb: () => refreshList(),
});

onMounted(async () => {
  await getReceiveRecordList();
});

defineExpose({
  getReceiveRecordList,
});
</script>

<style lang="scss">
.c-mobile-cash-receive-record__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #ededef;
}
.c-mobile-cash-receive-record__item-type {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  font-size: 14px;
  line-height: 20px;
  color: #333;

  span {
    margin-left: 4px;
    font-size: 12px;
    color: #3f76fc;
  }
}
.c-mobile-cash-receive-record__item-date {
  font-size: 12px;
  color: #666666;
}
.c-mobile-cash-receive-record__item-amount {
  color: #333;
}
.c-mobile-cash-receive-record__item--loading {
  padding-top: 10px;
  text-align: center;
}
</style>
