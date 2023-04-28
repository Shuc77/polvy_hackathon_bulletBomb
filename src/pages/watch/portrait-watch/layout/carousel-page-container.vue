<!-- @file 竖屏轮播屏页面容器 -->
<template>
  <div
    class="c-portrait-carousel-page-container"
    @click.self="onClickContainer"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';

function onClickContainer(event: MouseEvent) {
  eventBus.$emit(appEvents.portrait.ClickPlayerRegion, event);
}
</script>

<style lang="scss">
.c-portrait-carousel-page-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
