<!-- @file 移动端-竖屏-微活动挂件 -->
<template>
  <div
    class="c-portrait-micro-activity-pendant"
    @click="showMicroActivity"
    :style="iconStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { eventBus, appEvents } from '@/app/app-events';
import { useMicroActivityStore } from '@/store/use-micro-activity-store';

const microActivityStore = useMicroActivityStore();

const iconStyle = computed(() => {
  const defaultIconUrl = 'https://s4.videocc.net/default-img/widget/icon-game.svg';
  return {
    'background-image': `url(${microActivityStore.microActivityPendantIcon || defaultIconUrl})`,
  };
});

function showMicroActivity() {
  eventBus.$emit(appEvents.microActivity.OpenPortraitMicroActivity, true);
}
</script>

<style lang="scss">
.c-portrait-micro-activity-pendant {
  z-index: 110;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
