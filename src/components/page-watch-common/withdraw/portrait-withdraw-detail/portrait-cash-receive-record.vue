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
        {{ getWithdrawStatusText(record.status) }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__date">
        {{ convertReceiveDate(record.applyTime) }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__amount pws-mobile-withdraw-highlight">
        {{ convertAmount(record.amount) }}
      </p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useReceiveRecordHook, getWithdrawStatusText } from '../_hooks/use-receive-record';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

const { getWatchCore } = useGlobalInject();

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
