<!-- @file 竖屏轮播屏页面容器 -->
<template>
  <div
    ref="containerRef"
    class="c-portrait-carousel-page-container"
    @click.self="onClickContainer"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { appEvents, eventBus } from '@/app/app-events';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { useWebviewFeedTouch } from '@/hooks/behaviors/use-webview-feed';
import { ref } from 'vue';

const props = defineProps({
  clickForPlayer: PropUtils.bool.def(false),
});

function onClickContainer(event: MouseEvent) {
  if (props.clickForPlayer) {
    eventBus.$emit(appEvents.portrait.ClickPlayerRegion, event);
  }
}

const containerRef = ref<HTMLDivElement>();
const { onTouchStart, onTouchMove, onTouchEnd } = useWebviewFeedTouch({ maxDelta: 50 });
</script>

<style lang="scss">
.c-portrait-carousel-page-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
