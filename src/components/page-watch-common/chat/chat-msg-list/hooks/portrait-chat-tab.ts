import { ref, onMounted, nextTick, watch, unref, onUnmounted, computed } from 'vue';
import { AskEvents, ChannelMenuType } from '@polyv/live-watch-sdk';
import AlloyFinger from 'alloyfinger';
import { usePortraitLayoutStore, PortraitChatTabType } from '@/store/use-portrait-layout-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getWatchCore } from '@/core/watch-sdk';
import { translate } from '@/assets/lang';

/**  切换分页符宽度 */
const PAGE_BREAK_WIDTH = 38;
export const usePortraitChatTab = (hookOptions: { onAskMsg: () => void }) => {
  const { onAskMsg } = hookOptions;
  const watchCore = getWatchCore();

  const { portraitChatTab } = storeDefinitionToRefs(usePortraitLayoutStore);
  const { askMenuData, getMenuData } = useChannelMenuStore();

  /** 是否展示过渡 */
  const isShowTransition = ref(false);
  /** 右边分页符的长度 */
  const rightPageWidth = ref(0);
  /** 左边分页符的长度 */
  const leftPageWidth = ref(PAGE_BREAK_WIDTH);
  /** 开始触摸x,y轴的位置 */
  const startPosition = ref({
    startY: 0,
    startX: 0,
  });
  /** 移动时x,y轴的位置 */
  const prePosition = ref({
    preX: 0,
    preY: 0,
  });
  /** 聊天室轮播屏的宽度 */
  const carouselWidth = ref(0);

  /** 提问SDK */
  const askSdk = ref();

  /** 竖屏下提问是否有新消息 */
  const portraitAskHasNews = ref(false);

  const carouselRef = ref<{ $el: HTMLDivElement }>();

  /** 当前轮播图激活的索引值 */
  const carouseActiveIndex = ref(0);

  watch(
    () => portraitChatTab.value,
    value => {
      isShowTransition.value = true;
      rightPageWidth.value = value === PortraitChatTabType.Ask ? PAGE_BREAK_WIDTH : 0;
      leftPageWidth.value = value === PortraitChatTabType.Chat ? PAGE_BREAK_WIDTH : 0;
    },
  );

  const getCarouselWidth = () => {
    if (carouselWidth.value) {
      return carouselWidth.value;
    } else {
      carouselWidth.value = carouselRef.value?.$el.clientWidth || 0;
      return carouselWidth.value;
    }
  };

  const setSwitchProcessWidth = (event: TouchEvent) => {
    const touch = event.touches[0];
    const carouselWidth = getCarouselWidth();
    const preX = touch.pageX - startPosition.value.startX;
    if (
      (preX > 0 && portraitChatTab.value === PortraitChatTabType.Chat) ||
      (preX < 0 && portraitChatTab.value === PortraitChatTabType.Ask)
    ) {
      return;
    }

    if (startPosition.value) {
      const { startX: preX, startY: preY } = startPosition.value;
      const { pageX: nowX, pageY: nowY } = touch;
      const diffY = nowY - preY;
      const diffX = nowX - preX;
      const touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
      if (touchAngle > 45) {
        return;
      }
    }

    if (preX < 0) {
      rightPageWidth.value = Math.abs(PAGE_BREAK_WIDTH * (preX / carouselWidth));
      leftPageWidth.value = PAGE_BREAK_WIDTH - rightPageWidth.value;
    } else {
      leftPageWidth.value = Math.abs(PAGE_BREAK_WIDTH * (preX / carouselWidth));
      rightPageWidth.value = PAGE_BREAK_WIDTH - leftPageWidth.value;
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    startPosition.value = {
      startX: touch.pageX,
      startY: touch.pageY,
    };
  };

  const handleTouchMove = (event: TouchEvent) => {
    isShowTransition.value = false;
    const touch = event.touches[0];
    prePosition.value = {
      preX: touch.pageX,
      preY: touch.pageY,
    };
    setSwitchProcessWidth(event);
    event.stopPropagation();
  };

  const handleTouchEnd = () => {
    if (!unref(prePosition).preY && !unref(prePosition).preX) {
      return;
    }
    isShowTransition.value = true;
    const moveDiff = prePosition.value.preX - startPosition.value.startX;
    if (Math.abs(moveDiff) > getCarouselWidth() / 2) {
      rightPageWidth.value = moveDiff < 0 ? PAGE_BREAK_WIDTH : 0;
      leftPageWidth.value = moveDiff > 0 ? PAGE_BREAK_WIDTH : 0;
    } else {
      rightPageWidth.value =
        unref(portraitChatTab) === PortraitChatTabType.Ask ? PAGE_BREAK_WIDTH : 0;
      leftPageWidth.value =
        unref(portraitChatTab) === PortraitChatTabType.Chat ? PAGE_BREAK_WIDTH : 0;
    }
  };

  onMounted(() => {
    if (askMenuData.visible) {
      askSdk.value = watchCore.ask.getAskSdk();
      askSdk.value.setup();
      watchCore.ask.eventEmitter.on(AskEvents.TeacherAnswer, onAskMsg);
    }
    nextTick(() => {
      const $carouselRef = carouselRef.value;
      new AlloyFinger($carouselRef?.$el as HTMLDivElement, {
        touchStart: handleTouchStart,
        touchEnd: handleTouchEnd,
        touchMove: handleTouchMove,
      });
    });
  });

  /** 获取欢迎语 */
  const quizWelcomeText = computed(() => {
    return getMenuData(ChannelMenuType.Quiz)?.content || translate('ask.placeholderMsg');
  });

  onUnmounted(() => {
    watchCore.ask.eventEmitter.off(AskEvents.TeacherAnswer, onAskMsg);
  });

  return {
    askSdk,
    portraitAskHasNews,
    carouselRef,
    leftPageWidth,
    isShowTransition,
    rightPageWidth,
    askMenuData,
    carouseActiveIndex,
    quizWelcomeText,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
  };
};
