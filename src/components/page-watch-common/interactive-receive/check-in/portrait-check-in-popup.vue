<!-- @file 竖屏签到弹层 -->
<template>
  <iar-portrait-check-in
    ref="checkInRef"
    class="c-portrait-check-in-popup"
    v-show="checkInVisible"
    enable-sound-effects
    :check-in-sdk="checkInSdk"
    :is-full-screen="isIarFullScreen"
    @show-entrance="showEntrance"
    @to-show="setCheckInVisible(true, false)"
    @to-hide="setCheckInVisible(false)"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useCheckIn } from './hooks/use-check-in';

const IarPortraitCheckIn = getIarComponent('PortraitCheckIn');

const { isIarFullScreen } = storeDefinitionToRefs(useInteractReceiveStore);

const { checkInSdk, checkInVisible, setCheckInVisible, showEntrance, checkInRef } = useCheckIn();
</script>
