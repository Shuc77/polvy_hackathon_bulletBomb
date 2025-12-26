<template>
  <div
    v-show="!portraitPlayerIsPageFullscreen"
    class="c-portrait-carousel-main-screen__bottom__item c-portrait-carousel-main-screen__bottom__item--padding c-portrait-carousel-main-screen__bottom__item--pointer-event"
    @click="onClickPlayerRegion"
  >
    <div
      class="c-portrait-carousel-main-screen__swiper-msg__wrap"
      :class="{
        'has-product-bubble': productBubbleVisible,
      }"
    >
      <div
        class="c-portrait-carousel-main-screen__swiper-container"
        :style="{
          height: `${swiperHeight}px`,
        }"
      >
        <chat-ask-swiper-section
          :swiper-list="swiperList"
          @slide-reach-beginning="onSlideReachBeginning"
          @slide-reach-end="onSlideReachEnd"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusEmitter } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useEventBusListener, useWindowResizeListener } from '@polyv/vue-components';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

const webViewStore = useWebviewStore();
const { productBubbleVisible } = storeDefinitionToRefs(useInteractReceiveStore);
const { chatMenuData, askMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const portraitLayoutStore = usePortraitLayoutStore();
const { portraitPlayerIsPageFullscreen } = storeToRefs(portraitLayoutStore);

const { emitEvent: onClickPlayerRegion } = useEventBusEmitter(appEvents.portrait.ClickPlayerRegion);

const PolyvChatUI = getChatUIV2Pkg();

const { SwiperSection: ChatAskSwiperSection, useSendChatMsg } = PolyvChatUI;

// 监听发送图片事件
const { choiceImageFileSend } = useSendChatMsg();
useEventBusListener(appEvents.chat.ToSendImage, choiceImageFileSend);

/** 消息区轮播列表 */
const swiperList = computed(() => {
  const list: Array<'ask' | 'chat'> = [];

  if (chatMenuData.value.visible) {
    list.push('chat');
  }

  if (askMenuData.value.visible) {
    list.push('ask');
  }

  return list;
});

const swiperHeight = ref(getSwiperHeight());

/**
 * 获取轮播区域高度
 */
function getSwiperHeight() {
  return document.documentElement.clientHeight * 0.24;
}

function resetSwiperHeight() {
  // 延迟 300 毫秒，确保页面布局已更新
  setTimeout(() => {
    swiperHeight.value = getSwiperHeight();
  }, 300);
}

useWindowResizeListener(() => {
  resetSwiperHeight();
});

if (webViewStore.isPlvWebview) {
  watch(
    () => webViewStore.isSmallWindow,
    () => {
      if (!webViewStore.isSmallWindow) {
        resetSwiperHeight();
      }
    },
  );
}

function onSlideReachBeginning() {
  portraitLayoutStore.$patch({
    carouselActiveIndex: portraitLayoutStore.carouselActiveIndex - 1,
  });
}

function onSlideReachEnd() {
  portraitLayoutStore.$patch({
    carouselActiveIndex: portraitLayoutStore.carouselActiveIndex + 1,
  });
}
</script>

<style lang="scss">
.c-portrait-carousel-main-screen__swiper-msg__wrap {
  box-sizing: border-box;
  width: 100%;
  padding-right: 54px;

  &.has-product-bubble {
    padding-right: 120px;
  }
}

.c-portrait-carousel-main-screen__swiper-container {
  width: 100%;
  height: 208px;
  pointer-events: initial;
}
</style>
