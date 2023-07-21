<!-- @file 竖屏签到弹层 -->
<template>
  <iar-portrait-check-in
    ref="checkInRef"
    class="c-portrait-check-in-popup"
    v-show="checkInVisible"
    :check-in-sdk="checkInSdk"
    @show-entrance="showEntrance"
    @to-show="setCheckInVisible(true)"
    @to-hide="setCheckInVisible(false)"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useCheckIn } from './hooks/use-check-in';

const IarPortraitCheckIn = getIarComponent('PortraitCheckIn');

const { checkInSdk, checkInVisible, setCheckInVisible, showEntrance, checkInRef } = useCheckIn();
</script>
