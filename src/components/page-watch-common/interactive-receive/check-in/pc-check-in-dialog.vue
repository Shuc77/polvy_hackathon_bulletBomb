<!-- @file PC 端签到弹层 -->
<template>
  <pc-dialog
    class="c-pc-check-in-dialog"
    :mount-el="dialogMountEl"
    :title="checkInTitle"
    :visible.sync="checkInVisible"
  >
    <iar-pc-check-in
      :check-in-sdk="checkInSdk"
      enable-sound-effects
      :mount-node="dialogMountEl"
      @to-show="setCheckInVisible(true)"
      @to-hide="setCheckInVisible(false)"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';

import { useLayoutStore } from '@/store/use-layout-store';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';

import { useCheckIn } from './hooks/use-check-in';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarPcCheckIn = getIarComponent('PcCheckIn');

const { checkInSdk, checkInVisible, setCheckInVisible, checkInTitle } = useCheckIn();

const layoutStore = useLayoutStore();

/** 弹层渲染节点 */
const dialogMountEl = computed(() => {
  return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : '';
});
</script>
