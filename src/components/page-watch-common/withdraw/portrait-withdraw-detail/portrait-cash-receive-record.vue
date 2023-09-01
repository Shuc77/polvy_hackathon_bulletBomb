<template>
  <ul
    ref="list"
    class="c-portrait-withdraw-detail__contents"
    :class="{
      'c-portrait-withdraw-detail__contents--pb': isNotMore,
    }"
  >
    <li
      v-for="record in receiveRecordList"
      :key="record.withdrawId"
      class="c-portrait-withdraw-detail__contents__item"
    >
      <p class="c-portrait-withdraw-detail__contents__item__title">
        {{ $lang('withdraw.cash.receive.record.listName') }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__date">
        {{ convertReceiveDate(record.applyTime) }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__amount">
        {{ convertAmount(record.amount) }}
      </p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { getWatchCore } from '@/core/watch-sdk';
import { useReceiveRecordHook } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';

const watchCore = getWatchCore();

const {
  isNotMore,
  receiveRecordList,

  convertReceiveDate,
  convertAmount,
  getReceiveRecordList,
} = useReceiveRecordHook({
  fetchMethod: params => watchCore.withdraw.getWithdrawRecord(params),
  errMsg: translate('withdraw.cash.receive.history.error'),
});

onMounted(() => {
  getReceiveRecordList();
});

defineExpose({
  getReceiveRecordList,
});
</script>
