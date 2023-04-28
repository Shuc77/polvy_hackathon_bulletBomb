<!-- @file 竖屏更多入口 -->
<template>
  <div class="c-portrait-menu-entrance">
    <div
      class="c-portrait-menu-entrance__content"
      @click="onClickEntrance"
    ></div>

    <portrait-menu-popup />
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import PortraitMenuPopup from './portrait-menu-popup.vue';

const { emitEvent: onClickEntrance } = useEventBusEmitter(appEvents.portrait.OpenMenuPopup);
</script>

<style lang="scss">
.c-portrait-menu-entrance__content {
  width: 100%;
  height: 100%;
  background-image: url(./images/icon-more.png);
  background-size: 100% 100%;
}
</style>
