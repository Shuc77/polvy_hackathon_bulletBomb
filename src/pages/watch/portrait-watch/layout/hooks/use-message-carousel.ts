import AlloyFinger from 'alloyfinger';
import { nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import { useAskStore } from '@/store/use-ask-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';

/**
 * 竖屏消息区轮播 hook
 */
export const useMessageCarousel = () => {
  const portraitLayoutStore = usePortraitLayoutStore();
  const askStore = useAskStore();

  const carouselRef = ref<{ $el: HTMLDivElement }>();

  const carouselHeight = ref(getCarouselHeight());

  /**
   * 获取轮播区域高度
   */
  function getCarouselHeight() {
    return document.documentElement.clientHeight * 0.24;
  }

  function onWindowResize() {
    carouselHeight.value = getCarouselHeight();
  }

  const messageCarouselActiveIndex = ref(0);

  watch(
    () => unref(messageCarouselActiveIndex),
    () => {
      let currentName = PortraitChatTabName.Chat;
      switch (unref(messageCarouselActiveIndex)) {
        case 0:
          currentName = PortraitChatTabName.Chat;
          break;
        case 1:
          currentName = PortraitChatTabName.Ask;
          break;
      }

      portraitLayoutStore.$patch({
        portraitMessageTabCurrentName: currentName,
      });

      if (currentName === PortraitChatTabName.Ask) {
        askStore.$patch({
          askReminderVisible: false,
        });
      }
    },
  );

  watch(
    () => portraitLayoutStore.portraitMessageTabCurrentName,
    () => {
      let index = 0;
      switch (portraitLayoutStore.portraitMessageTabCurrentName) {
        case PortraitChatTabName.Chat:
          index = 0;
          break;
        case PortraitChatTabName.Ask:
          index = 1;
          break;
      }
      if (index !== messageCarouselActiveIndex.value) {
        messageCarouselActiveIndex.value = index;
      }
    },
  );

  const handleTouchStart = (event: TouchEvent) => {
    event.stopPropagation();
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.stopPropagation();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.stopPropagation();
  };

  onMounted(() => {
    nextTick(() => {
      const $carouselRef = carouselRef.value;
      new AlloyFinger($carouselRef?.$el as HTMLDivElement, {
        touchStart: handleTouchStart,
        touchEnd: handleTouchEnd,
        touchMove: handleTouchMove,
      });
    });

    window.addEventListener('resize', onWindowResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  function onMessageCarouselSlidePrevEnd() {
    portraitLayoutStore.$patch({
      carouselActiveIndex: portraitLayoutStore.carouselActiveIndex - 1,
    });
  }

  function onMessageCarouselSlideNextEnd() {
    portraitLayoutStore.$patch({
      carouselActiveIndex: portraitLayoutStore.carouselActiveIndex + 1,
    });
  }

  return {
    carouselRef,
    carouselHeight,
    messageCarouselActiveIndex,

    onMessageCarouselSlidePrevEnd,
    onMessageCarouselSlideNextEnd,
  };
};
