<!-- @file 移动端横屏-提现详情-红包领取记录(现金) -->
<template>
  <ul class="c-mobile-redpack-receive-record">
    <li
      v-for="record in receiveRecordList"
      :key="record.logId"
      class="c-mobile-redpack-receive-record__item"
    >
      <div>
        <p class="c-mobile-redpack-receive-record__item-type">
          {{ $lang('withdraw.redpack.receive.record.listName') }}
        </p>
        <p class="c-mobile-redpack-receive-record__item-date">
          {{ convertReceiveDate(record.receiveTime) }}
        </p>
      </div>
      <p class="c-mobile-redpack-receive-record__item-amount pws-mobile-withdraw-highlight">
        +{{ convertAmount(record.amount) }}
      </p>
    </li>
    <li
      v-show="loadingVisible"
      class="c-mobile-redpack-receive-record__item--loading"
    >
      <list-loading />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import listLoading from '@/components/common-base/list-loading/list-loading.vue';

import { RedpackPayType } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useReceiveRecordHook } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';

const watchCore = getWatchCore();

const {
  loadingVisible,
  receiveRecordList,

  convertReceiveDate,
  convertAmount,
  getReceiveRecordList,
} = useReceiveRecordHook({
  fetchMethod: params => watchCore.redpack.getRedpackReceiveRecord(params),
  fetchMethodParams: {
    redPackType: RedpackPayType.Cash,
  },
  errMsg: translate('redpack.receive.history.error'),
});

onMounted(async () => {
  await getReceiveRecordList();
});

defineExpose({
  getReceiveRecordList,
});
</script>

<style lang="scss">
.c-mobile-redpack-receive-record {
  height: 100%;
  overflow: auto;
}
.c-mobile-redpack-receive-record__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #ededef;
}
.c-mobile-redpack-receive-record__item-type {
  margin-bottom: 2px;
  font-size: 14px;
  line-height: 20px;
  color: #333;
}
.c-mobile-redpack-receive-record__item-date {
  font-size: 12px;
  color: #666666;
}
.c-mobile-redpack-receive-record__item-amount {
  color: #3082fe;
}
.c-mobile-redpack-receive-record__item--loading {
  padding-top: 10px;
  text-align: center;
}
</style>
