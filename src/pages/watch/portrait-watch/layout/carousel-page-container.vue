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

    <!-- 退出清屏按钮 -->
    <transition name="fade">
      <portrait-exit-clear-screen-btn
        v-if="showExitClearScreenBtn"
        class="c-portrait-carousel-page-container__exit-btn"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { PropUtils } from '@polyv/vue-components';
import { computed, ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PortraitExitClearScreenBtn from '../components/exit-clear-screen-btn/portrait-exit-clear-screen-btn.vue';

const props = defineProps({
  clickForPlayer: PropUtils.bool.def(false),
  /** 是否为空白屏（清屏模式） */
  isBlankScreen: PropUtils.bool.def(false),
});

const feedInjectStore = useFeedInjectStore();
const { carouselActiveIndex } = storeDefinitionToRefs(usePortraitLayoutStore);

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

/**
 * 是否显示退出清屏按钮
 * 当处于清屏模式（carouselActiveIndex === 2）且当前容器是空白屏时显示
 */
const showExitClearScreenBtn = computed(() => {
  return props.isBlankScreen && carouselActiveIndex.value === 2;
});
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

.c-portrait-carousel-page-container__exit-btn {
  position: absolute;
  right: 12px;
  bottom: 34px;
  z-index: 100;
  pointer-events: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
