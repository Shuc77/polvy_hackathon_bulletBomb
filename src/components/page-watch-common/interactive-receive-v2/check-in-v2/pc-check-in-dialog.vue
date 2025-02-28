<!-- @file PC 端签到弹层 -->
<template>
  <pc-dialog
    class="c-pc-check-in-dialog"
    :mount-el="dialogMountEl"
    :title="checkInTitle"
    :visible.sync="checkInVisible"
  >
    <iar-pc-check-in
      v-if="targetInited"
      ref="checkInRef"
      :check-in-target="getIarTarget()"
      enable-sound-effects
      :mount-node="dialogMountEl"
      @show-entrance="showEntrance"
      @to-show="setCheckInVisible(true, false)"
      @to-hide="setCheckInVisible(false)"
      @check-in-status="onCheckInStatus"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { useCheckIn } from './hooks/use-check-in';
import { useIarUILoader } from '../_load-iar-ui-v2';

const {
  targetInited,
  getIarTarget,
  checkInRef,
  checkInVisible,
  checkInTitle,
  setCheckInVisible,
  showEntrance,
  onCheckInStatus,
} = useCheckIn();

const layoutStore = useLayoutStore();

/** 弹层渲染节点 */
const dialogMountEl = computed(() => {
  return layoutStore.isFullscreen ? PC_PLAYER_FULL_SCREEN_SELECTOR : '';
});

const { loadIarUI } = useIarUILoader('iar-check-in-ui');

const IarPcCheckIn = defineAsyncComponent(() => loadIarUI('pc-check-in'));
</script>
