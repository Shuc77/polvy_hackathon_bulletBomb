<!-- @file 竖屏端播放器 -->
<template>
  <div
    class="c-portrait-player-main"
    :class="{
      'c-portrait-player-main--none-live': noneLiveVisible,
      'c-portrait-player-main--hide-loading': isAndroid && isDingTalk,
    }"
  >
    <div
      class="c-portrait-player-main__container-wrap"
      :style="{
        paddingTop: `${portraitDocWrapHeight}px`,
      }"
    >
      <div class="c-portrait-player-main__container-wrap__content">
        <div
          ref="playerContainer"
          class="c-portrait-player-main__container"
          :class="{
            'c-portrait-player-main__container--audio': isAudioPlayerMode,
          }"
          :style="allPlayerContainerStyle"
        ></div>

        <!-- 播放器封面图 -->
        <portrait-player-cover-img />
      </div>
    </div>

    <!-- 播放按钮 -->
    <!-- @warn 该 Dom 只用来显示状态，实际用来控制播放的是 appEvents.portrait.ClickPlayerRegion 事件回调 -->
    <div
      v-if="normalPlayButtonVisible && !isSmallWindow"
      class="c-portrait-player-main__play-button g-img-cover"
    ></div>

    <!-- 暂无直播占位面板 -->
    <portrait-none-live-panel v-if="noneLiveVisible" />

    <!-- webview 小窗下的控制栏 -->
    <small-window-control v-if="isSmallWindow" />
  </div>
</template>

<script setup lang="ts">
import PortraitNoneLivePanel from '../../common/none-live-panel/portrait-none-live-panel.vue';
import PortraitPlayerCoverImg from '../../player-cover-img/portrait-player-cover-img.vue';
import SmallWindowControl from '../../player-control/common-player-control/small-window-control.vue';
import { usePlayerStore } from '@/store/use-player-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';
import { useResolutionSize } from '../../hooks/use-resolution-size';
import { usePortraitClickPlayer } from './_hooks/use-portrait-click-player';
import { usePortraitPlayerSize } from './use-portrait-player-size';
import { computed, unref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus, StreamType } from '@polyv/live-watch-sdk';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { FullscreenElement, useFullscreen } from '@/hooks/tools/use-fullscreen';

const channelStore = useChannelStore();

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      showController: false,
      barrageEnabled: false,
      banHeaderAdvertisement: true,
      banPassword: true,
    };
  },
});

const { noneLiveVisible, resolutionWidth, resolutionHeight, isAudioPlayerMode } =
  storeDefinitionToRefs(usePlayerStore);

const { portraitDocWrapHeight } = storeDefinitionToRefs(usePortraitLayoutStore);

const { normalPlayButtonVisible } = usePlayerControl();

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

usePortraitClickPlayer();

useResolutionSize({
  playerContainer,
});

const { playerContainerStyle } = usePortraitPlayerSize();

const allPlayerContainerStyle = computed<CSSProperties>(() => {
  const style = {
    ...unref(playerContainerStyle),
  };

  let resolutionProportion: number | undefined;
  if (resolutionHeight.value && resolutionWidth.value) {
    resolutionProportion = resolutionHeight.value / resolutionWidth.value;
  }

  /**
   * 条件：
   * 客户端推流
   * 显示了文档
   * 流比例超过 4:3（高：宽）
   */
  if (
    resolutionProportion &&
    resolutionProportion > 1.3 &&
    unref(portraitDocWrapHeight) > 0 &&
    channelStore.liveStatus === LiveStatus.Live &&
    channelStore.currentStreamType === StreamType.Client
  ) {
    style.marginTop = `-${unref(portraitDocWrapHeight) * (2 / 3)}px`;
  }

  return style;
});

const { toggleFullscreen, supportFullscreen } = useFullscreen(() => {
  return playerContainer.value?.querySelector('video') as FullscreenElement;
});

useEventBusListener(appEvents.portrait.PlayerSystemFullscreen, () => {
  if (supportFullscreen.value) {
    toggleFullscreen();
  } else {
    console.warn('不支持通用全屏 API');
    const videoEl = playerContainer.value?.querySelector('video') as any;
    if (videoEl && videoEl.webkitEnterFullScreen) {
      videoEl.webkitEnterFullScreen();
    } else {
      console.warn('不支持系统全屏');
    }
  }
});
</script>

<style lang="scss">
@import './_styles/cover-player-style.scss';

.c-portrait-player-main {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-portrait-player-main__container-wrap {
  position: relative;
  z-index: 5;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.c-portrait-player-main__container-wrap__content {
  position: relative;
  height: 100%;
}
.c-portrait-player-main__container {
  position: relative;
  width: 100%;
  height: 100%;
  // background: #212121;
}
.c-portrait-player-main__container--audio {
  opacity: 0;
}

// 在出现以下面板时，将播放器透明掉
.c-portrait-player-main--none-live {
  .c-portrait-player-main__container {
    opacity: 0;
  }
}

.c-portrait-placeholder-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;

  &::before {
    height: 51px;
    content: '';
  }
  &::after {
    height: 218px;
    content: '';
  }
}
.c-portrait-placeholder-panel__content {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 211px;
  margin-top: auto;
  margin-bottom: auto;
  background-color: #00021a;
}

.c-portrait-placeholder-panel--small-window {
  &::before,
  &::after {
    display: none;
  }

  .c-portrait-placeholder-panel__content {
    height: 100%;
  }
}

.c-portrait-player-main__play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 999;
  width: 80px;
  height: 80px;
  background-image: url(../../common/player-play-button/imgs/play-btn-2.png);
  transform: translate(-50%, -50%);
}

.c-portrait-player-main--hide-loading {
  .vcp-loading {
    display: none !important;
  }
}
</style>
