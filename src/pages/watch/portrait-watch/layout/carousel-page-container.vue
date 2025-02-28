<!-- @file 竖屏轮播屏页面容器 -->
<template>
  <div
    ref="containerRef"
    class="c-portrait-carousel-page-container"
    @click.self="onClickContainer"
  >
    <slot>
      <div
        class="c-portrait-carousel-blank-screen"
        @click.self="onClickContainer"
      ></div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { PropUtils } from '@/assets/utils/vue-utils/props-utils';
import { ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';

const props = defineProps({
  clickForPlayer: PropUtils.bool.def(false),
});

const feedInjectStore = useFeedInjectStore();

const { getEmitter } = useGlobalInject();

function onClickContainer(event: MouseEvent) {
  if (props.clickForPlayer) {
    getEmitter().emit(appEvents.portrait.ClickPlayerRegion, event);
  }

  if (isBuildForFeedMainMode() && feedInjectStore.inFirstFeedLayout) {
    getEmitter().emit(appEvents.global.EnterSecondFeedLayout);
  }
}

const containerRef = ref<HTMLDivElement>();
</script>

<style lang="scss">
.c-portrait-carousel-page-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-portrait-carousel-blank-screen {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}
</style>
