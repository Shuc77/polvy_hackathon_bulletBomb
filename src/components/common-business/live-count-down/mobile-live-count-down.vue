<!-- @file 移动端直播倒计时 -->
<template>
  <div class="c-live-count-down">
    <count-down
      :end-timestamp="liveStartTime"
      size="small"
      :theme="theme"
      :hide-zero-days="theme === 'text'"
      @count-down-change="onCountDownChange"
      @count-down-finish="onCountDownFinish"
    />
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import CountDown from '@/components/common-base/count-down/count-down.vue';
import { countdownThemes } from '@/components/common-base/count-down/types';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveCountDown } from './use-live-count-down';

defineProps({
  /** 倒计时样式，square-方形，text-文本，默认：square */
  theme: PropUtils.oneOf(countdownThemes).def('square'),
});

const { liveStartTime } = storeDefinitionToRefs(useChannelInfoStore);

const { onCountDownChange, onCountDownFinish } = useLiveCountDown();
</script>
