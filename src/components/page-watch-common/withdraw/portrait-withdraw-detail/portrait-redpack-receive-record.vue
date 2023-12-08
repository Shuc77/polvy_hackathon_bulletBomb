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
      :key="record.logId"
      class="c-portrait-withdraw-detail__contents__item"
    >
      <p class="c-portrait-withdraw-detail__contents__item__title">
        {{ $lang('withdraw.redpack.receive.record.listName') }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__date">
        {{ convertReceiveDate(record.receiveTime) }}
      </p>
      <p class="c-portrait-withdraw-detail__contents__item__amount pws-mobile-withdraw-highlight">
        {{ convertAmount(record.amount) }}
      </p>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { RedpackPayType } from '@polyv/live-watch-sdk';
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
