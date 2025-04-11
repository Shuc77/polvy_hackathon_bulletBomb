<!-- @file 移动端观看页主体布局 -->
<template>
  <div
    ref="layoutWrapRef"
    class="c-mobile-watch-layout"
  >
    <div class="c-mobile-watch-layout__page-notices">
      <!-- 发起转播频道被踢出提示 -->
      <mobile-page-notice
        v-if="chatExited"
        :tips="$lang('chat.transformTip')"
      />

      <!-- 聊天消息重放提示 -->
      <mobile-chat-msg-replay-tips />
    </div>

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
          mainScreen === MainScreenContent.Player ||
          mobileMenuCurrentName === TAB_NAME_DOC_OR_VIDEO ||
          isSmallWindow
        ),
        'c-mobile-watch-layout__player--sub-screen': mainScreen !== MainScreenContent.Player,
        'c-mobile-watch-layout__pip': isSmallWindow,
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
      <!-- webview 小窗下的控制栏 -->
      <small-window-control v-if="isSmallWindow" />
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

    <!-- 流多轨切换 -->
    <mobile-player-stream-track v-if="supportMultiStreamTrack" />

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

    <!-- 其他直播预约 -->
    <common-other-live-booking class="c-mobile-watch-layout__other-live-booking" />

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
import CommonOtherLiveBooking from '@/components/common-business/live-booking/common-other-live-booking/common-other-live-booking.vue';
import MobileChatMsgReplayTips from '@/components/page-watch-common/chat/chat-msg-replay-tips/mobile-chat-msg-replay-tips.vue';
import MobilePageNotice from '@/components/common-base/page-notice/mobile-page-notice.vue';
// import MobileWatchMenu from './mobile-watch-menu.vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { TAB_NAME_CHAT, TAB_NAME_DOC_OR_VIDEO } from '@/assets/constants/tab-name';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

import { MainScreenContent, MultiMeetingListLayout, PlayStatus } from '@polyv/live-watch-sdk';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useMultiMeetingStore } from '@/store/use-multi-meeting-store';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useWebviewStore } from '@/store/use-webview-store';
import SmallWindowControl from '@/components/page-watch-common/player/player-control/common-player-control/small-window-control.vue';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';
import { useChatStore } from '@/store/use-chat-store';

const MobileWatchMenu = defineAsyncComponent(
  () => import(/* webpackChunkName: "mobile-watch-menu" */ './mobile-watch-menu.vue'),
);

const { isPlaybackWatchUrl } = storeDefinitionToRefs(useWatchAppStore);

const { chatExited } = storeDefinitionToRefs(useChatStore);

const { supportMultiStreamTrack } = storeDefinitionToRefs(useChannelStore);

const { multiMeetingEnabled, multiMeetingListLayout } = storeDefinitionToRefs(useMultiMeetingStore);

const layoutStore = useLayoutStore();
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

const { canRenderPlayer, isPlayMode, playStatus } = storeDefinitionToRefs(usePlayerStore);
const { toPlayInLimit } = usePlayerAction();

const { canRenderDoc } = storeDefinitionToRefs(useDocStore);

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const layoutWrapRef = ref<HTMLDivElement>();
const layoutTopRef = ref<HTMLDivElement>();
const layoutBottomRef = ref<HTMLDivElement>();

useResizeObserver(layoutWrapRef, () => {
  layoutStore.$patch({
    mobileWatchLayoutHeight: layoutWrapRef.value?.clientHeight || 0,
  });
});

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

function onClickPlayerRegion() {
  // 当前处于暂停状态，触发播放
  if (isPlayMode.value && playStatus.value === PlayStatus.Pause) {
    toPlayInLimit();
  }
}

watch(
  () => [unref(filterConnectMicList).length],
  () => {
    computedLayoutSize();
  },
);

const { updateScreenOrientationModeManually, screenOrientationMode } = useScreenOrientHook({
  autoListen: true,
  autoListenCb: () => {
    computedLayoutSize();
  },
});

watch(isSmallWindow, () => {
  setTimeout(() => {
    updateScreenOrientationModeManually();
    layoutStore.$patch({ screenOrientationMode: screenOrientationMode.value });
    computedLayoutSize();
  }, 300);
});

useEventBusListener(appEvents.global.MobileLayoutComputedSize, computedLayoutSize);

useEventBusListener(appEvents.portrait.ClickPlayerRegion, onClickPlayerRegion);

useWindowResizeListener(() => {
  computedLayoutSize();
}, true);

onMounted(() => {
  computedLayoutSize();
});

const $stopWatch = watch(mobileMenuCurrentName, () => {
  if (mobileMenuCurrentName.value === TAB_NAME_CHAT) {
    layoutStore.$patch({
      mobileChatTabHasBeenShowed: true,
    });
    $stopWatch();
  }
});
</script>

<style lang="scss">
.c-mobile-watch-layout {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: #202127;
}

.c-mobile-watch-layout__page-notices {
  position: absolute;
  top: 8px;
  right: 12px;
  left: 12px;
  z-index: 100;
  box-sizing: border-box;
  pointer-events: none;

  .c-mobile-page-notice {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  &:empty {
    display: none;
  }
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
  .c-mobile-player-main--page-fullscreen {
    top: -20px !important;
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

.c-mobile-watch-layout__other-live-booking {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2200;
}

.c-mobile-watch-layout__player-tips {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 3000;
  transform: translateX(-50%);
}

.c-mobile-watch-layout__pip {
  top: 0 !important;
  z-index: 4001;
  height: 100% !important;
  .c-mobile-watch-layout__player__content {
    height: 100% !important;
  }
  .plwrap {
    > div:not(.plvideo, .plv-live-watermark) {
      display: none !important;
    }
  }

  .plv-player-container {
    > div:not(.plv-player-video__wrap, .plv-player-cover) {
      display: none !important;
    }
  }

  .c-mobile-player-main__play-btn {
    display: none;
  }
}
</style>
