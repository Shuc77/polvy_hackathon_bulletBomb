<!-- @file 移动端观看页主体布局 -->
<template>
  <div
    ref="layoutWrapRef"
    class="c-mobile-watch-layout"
  >
    <!-- 顶部占位 -->
    <div
      ref="layoutTopRef"
      class="c-mobile-watch-layout__top"
    ></div>

    <!-- 播放器 -->
    <div
      v-if="canRenderPlayer"
      class="c-mobile-watch-layout__player"
      :class="{
        'c-mobile-watch-layout__player--hide': !(
          mainScreen === MainScreenContent.Player || mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO
        ),
        'c-mobile-watch-layout__player--sub-screen': mainScreen !== MainScreenContent.Player,
      }"
      :style="getScreenStyles(MainScreenContent.Player)"
    >
      <div class="c-mobile-watch-layout__player__content">
        <div class="c-mobile-watch-layout__player__content__inner">
          <mobile-connect-mic-user-item
            v-if="masterMicItem"
            :key="`master-stream-${masterMicItem.streamId}`"
            :mic-item="masterMicItem"
          />
          <mobile-player-main />
        </div>
      </div>
    </div>

    <!-- 文档 -->
    <div
      v-if="canRenderDoc"
      class="c-mobile-watch-layout__doc pws-mobile-doc-container"
      :class="{
        'c-mobile-watch-layout__doc--hide': !(
          mainScreen === MainScreenContent.Doc || mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO
        ),
        'c-mobile-watch-layout__doc--sub-screen': mainScreen !== MainScreenContent.Doc,
        'c-mobile-watch-layout__doc--page-fullscreen': mobileDocIsPageFullscreen,
      }"
      :style="getScreenStyles(MainScreenContent.Doc)"
    >
      <mobile-doc />
    </div>

    <!-- 直播倒计时 + 直播预约层 -->
    <div
      class="c-mobile-watch-layout__top-layer"
      :style="mainScreenStyles"
    >
      <mobile-count-down-layer />
    </div>

    <!-- 连麦区 -->
    <div
      v-if="filterConnectMicList.length"
      class="c-mobile-watch-layout__connect-mic"
    >
      <mobile-connect-mic-user-list />
    </div>

    <!-- 双语流切换 -->
    <mobile-player-stream-track v-if="supportLanguageStream" />

    <!-- 页面广告 -->
    <mobile-page-advert v-if="!isPlaybackWatchUrl" />

    <!-- 多会场（横向布局） -->
    <mobile-multi-meeting-horizontal
      v-if="
        !isPlaybackWatchUrl &&
        multiMeetingEnabled &&
        multiMeetingListLayout === MultiMeetingListLayout.Horizontal
      "
    />

    <!-- 评论上墙 -->
    <speak-top-business
      class="c-mobile-watch-layout__speak-to-top"
      layout="mobile"
    ></speak-top-business>

    <!-- 底部区域 -->
    <div
      ref="layoutBottomRef"
      class="c-mobile-watch-layout__bottom"
    >
      <!-- 快速答题卡 -->
      <div class="c-mobile-watch-layout__quick-answer-card">
        <mobile-quick-answer-card v-if="iarSdkLoaded" />
      </div>

      <!-- 菜单栏 -->
      <mobile-watch-menu />
    </div>

    <!-- 显示在顶部的播放器提示 -->
    <player-tips
      :is-normal-mobile-layout="true"
      class="c-mobile-watch-layout__player-tips"
    ></player-tips>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, ref, unref, watch } from 'vue';

import MobileConnectMicUserItem from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-user-item.vue';
import MobileConnectMicUserList from '@/components/page-watch-common/connect-mic/mobile-connect-mic/mobile-connect-mic-user-list.vue';
import MobileDoc from '@/components/page-watch-common/doc/mobile-doc.vue';
import MobileQuickAnswerCard from '@/components/page-watch-common/interactive-receive/answer-card/mobile-quick-answer-card.vue';
import MobilePlayerMain from '@/components/page-watch-common/player/player-main/mobile-player-main/mobile-player-main.vue';
import MobileCountDownLayer from '@/components/page-watch-common/count-down-layer/mobile-count-down-layer.vue';
import MobilePageAdvert from '@/components/page-watch-common/page-advert/mobile-page-advert.vue';
import MobileMultiMeetingHorizontal from '@/components/page-watch-common/multi-meeting/mobile-multi-meeting/mobile-multi-meeting-horizontal.vue';
import MobilePlayerStreamTrack from '@/components/page-watch-common/player/player-stream-track/mobile-player-stream-track.vue';
import SpeakTopBusiness from '@/components/page-watch-common/chat/chat-speak-top/speak-top-business.vue';
import PlayerTips from '@/components/page-watch-common/player/player-control/player-tips/player-tips.vue';
// import MobileWatchMenu from './mobile-watch-menu.vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { TAB_NAME_DOC_OR_VIDEO } from '@/assets/constants/tab-name';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

import { MainScreenContent, MultiMeetingListLayout } from '@polyv/live-watch-sdk';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerStore } from '@/store/use-player-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const MobileWatchMenu = defineAsyncComponent(
  () => import(/* webpackChunkName: "mobile-watch-menu" */ './mobile-watch-menu.vue'),
);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { multiMeetingEnabled, multiMeetingListLayout } = storeDefinitionToRefs(useMultiMeetingStore);

const {
  isHorizontalScreenOrientation,
  isVerticalScreenOrientation,
  mainScreen,
  mobileMenuCurrentName,
  mobileMenuHeaderHeight,
  mobileLayoutTopHeight,
  mobileLayoutBottomHeight,
  mobileLayoutBottomTop,
  mobileDocIsPageFullscreen,
} = storeDefinitionToRefs(useLayoutStore);

const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { filterConnectMicList, masterMicItem } = storeDefinitionToRefs(useConnectMicStore);

const { canRenderPlayer, supportLanguageStream } = storeDefinitionToRefs(usePlayerStore);

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const layoutWrapRef = ref<HTMLDivElement>();
const layoutTopRef = ref<HTMLDivElement>();
const layoutBottomRef = ref<HTMLDivElement>();

// 顶部占位距离 => 决定 layoutTopElem.clientHeight => 决定播放器高度
const layoutTopDistance = computed(() => {
  if (!canRenderPlayer.value) return '0';

  if (isVerticalScreenOrientation.value) return '56.25%';
  if (isHorizontalScreenOrientation.value) return `${document.documentElement.clientHeight}px`;
  return '56.25%';
});

/** 主屏的样式 */
const mainScreenStyles = computed(() => {
  return {
    height: `${unref(mobileLayoutTopHeight)}px`,
    top: 0,
  };
});

/** 副屏的样式 */
const subScreenStyles = computed(() => {
  return {
    height: `${unref(mobileLayoutBottomHeight) - unref(mobileMenuHeaderHeight)}px`,
    top: `${unref(mobileLayoutBottomTop) + unref(mobileMenuHeaderHeight)}px`,
  };
});

function getScreenStyles(content: MainScreenContent) {
  if (
    (content === MainScreenContent.Player && unref(mainScreen) === MainScreenContent.Player) ||
    (content === MainScreenContent.Doc && unref(mainScreen) === MainScreenContent.Doc)
  ) {
    return unref(mainScreenStyles);
  }
  return unref(subScreenStyles);
}

/** 计算布局数据 */
async function computedLayoutSize() {
  await nextTick();
  const layoutWrapElem = unref(layoutWrapRef);
  const layoutTopElem = unref(layoutTopRef);
  const layoutBottomElem = unref(layoutBottomRef);
  if (!layoutWrapElem || !layoutTopElem || !layoutBottomElem) return;

  const wrapHeight = layoutWrapElem.clientHeight;

  mobileLayoutTopHeight.value = layoutTopElem.clientHeight;
  mobileLayoutBottomHeight.value = layoutBottomElem.clientHeight;
  mobileLayoutBottomTop.value = wrapHeight - mobileLayoutBottomHeight.value;
}

watch(
  () => [unref(filterConnectMicList).length],
  () => {
    computedLayoutSize();
  },
);

useEventBusListener(appEvents.global.MobileLayoutComputedSize, computedLayoutSize);

useWindowResizeListener(() => {
  computedLayoutSize();
}, true);

useScreenOrientHook({
  autoListen: true,
  autoListenCb: () => {
    computedLayoutSize();
  },
});

onMounted(() => {
  computedLayoutSize();
});
</script>

<style lang="scss">
.c-mobile-watch-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #202127;
}

.c-mobile-watch-layout__top {
  pointer-events: none;
  &::after {
    display: block;
    width: 100%;
    height: 0;
    /* stylelint-disable-next-line */
    padding-bottom: v-bind(layoutTopDistance);
    pointer-events: none;
    content: '';
  }
}

.c-mobile-watch-layout__bottom {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.c-mobile-watch-layout__player,
.c-mobile-watch-layout__doc {
  position: absolute;
  left: 0;
  width: 100%;
}

.c-mobile-watch-layout__doc {
  background: #202127;
}

.c-mobile-watch-layout__player__content,
.c-mobile-watch-layout__player__content__inner {
  width: 100%;
  height: 100%;
}

.c-mobile-watch-layout__player--sub-screen {
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  .c-mobile-watch-layout__player__content {
    position: relative;
    flex-shrink: 0;
    height: 0;
    padding-bottom: 56.25%;
  }
  .c-mobile-watch-layout__player__content__inner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

.c-mobile-watch-layout__player--hide,
.c-mobile-watch-layout__doc--hide {
  z-index: -1 !important;
  pointer-events: none;
  opacity: 0;
}

.c-mobile-watch-layout__player--page-fullscreen {
  position: fixed;
  top: 50% !important;
  left: 50% !important;
  z-index: 2000 !important;
  width: 100vh !important;
  height: 100vw !important;
  transform: rotate(90deg);
  transform-origin: center center;
}

.c-mobile-watch-layout__top-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  width: 100%;
  pointer-events: none;
}

.c-mobile-watch-layout__quick-answer-card {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 120;
  width: 100%;
  overflow: auto;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.c-mobile-watch-layout__doc--page-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 999;
  width: 100% !important;
  height: 100% !important;
}

.c-mobile-watch-layout__speak-to-top {
  z-index: 2300;
}
.c-mobile-watch-layout__player-tips {
  position: absolute;
  top: 32px;
  left: 50%;
  z-index: 3000;
  transform: translateX(-50%);
}
</style>
