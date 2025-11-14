<!-- @file 竖屏端播放器 -->
<template>
  <div
    class="c-portrait-player-main"
    :class="{
      'c-portrait-player-main--none-live': noneLiveVisible,
      'c-portrait-player-main--hide-loading': isAndroid && isDingTalk,
      'c-portrait-player-main--hide': isConnectMicing,
      'c-portrait-player-main--guide-portrait-stream-fit': hasGuidePortraitStreamFitClass,
    }"
    @click="onClickContainer"
  >
    <div
      class="c-portrait-player-main__container-wrap"
      :style="playerStyle"
    >
      <div class="c-portrait-player-main__container-wrap__content">
        <div
          ref="playerContainer"
          class="c-portrait-player-main__container"
          :class="{
            'c-portrait-player-main__container--audio': isAudioPlayerMode,
          }"
          :style="allPlayerContainerStyle"
          data-testid="plv-player-container"
          @click="onClickPlayerRegion"
        >
          <div
            v-if="playerSdkLoadError"
            class="c-portrait-player-main__player-sdk-load-error"
          >
            {{ $lang('player.error.sdkLoad') }}
          </div>
        </div>

        <!-- 播放器封面图 -->
        <portrait-player-cover-img />

        <!-- 播放按钮 -->
        <!-- @warn 该 Dom 只用来显示状态，实际用来控制播放的是 appEvents.portrait.ClickPlayerRegion 事件回调 -->
        <player-business-play-button :style="playerButtonStyle" />
      </div>
    </div>

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
import PlayerBusinessPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-business-button.vue';
import { usePlayerStore } from '@/store/use-player-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useDocStore } from '@/store/use-doc-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';
import { useResolutionSize } from '../../hooks/use-resolution-size';
import { usePortraitClickPlayer } from './_hooks/use-portrait-click-player';
import { useConnectMicing } from '../../hooks/use-connect-micing';
import { usePortraitPlayerSize } from './use-portrait-player-size';
import { computed, unref, onBeforeUnmount } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { useChannelStore } from '@/store/use-channel-store';
import { LiveStatus, MainScreenContent, StreamType } from '@polyv/live-watch-sdk';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { FullscreenElement, useFullscreen } from '@/hooks/tools/use-fullscreen';
import { useLayoutStore } from '@/store/use-layout-store';

const { mainScreen } = storeDefinitionToRefs(useLayoutStore);

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

const {
  playerSdkLoadError,

  noneLiveVisible,
  resolutionWidth,
  resolutionHeight,
  isAudioPlayerMode,
  hasGuidePortraitStreamFitClass,
} = storeDefinitionToRefs(usePlayerStore);

const { portraitDocWrapHeight, portraitDocSideSwitchVisible } =
  storeDefinitionToRefs(usePortraitLayoutStore);

const { addHistoryTipsListener } = usePlayerControl();

const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

const { isConnectMicing, masterMicItem } = storeDefinitionToRefs(useConnectMicStore);

const { documentSwitch } = storeDefinitionToRefs(useDocStore);

const isDocMainScreen = computed(() => {
  return (
    mainScreen.value === MainScreenContent.Doc &&
    portraitDocSideSwitchVisible.value &&
    !masterMicItem.value
  );
});

const playerStyle = computed<CSSProperties>(() => {
  if (!isDocMainScreen.value) {
    return {
      paddingTop: `${portraitDocWrapHeight.value}px`,
    };
  } else {
    return {};
  }
});

const { onClickPlayerRegion } = usePortraitClickPlayer();

const onClickContainer = (event: MouseEvent) => {
  if (isDocMainScreen.value) {
    onClickPlayerRegion(event);
  }
};

useResolutionSize({
  playerContainer,
});

/** 绑定历史播放进度提示事件 */
const { dispose: disposeHistoryTipsListener } = addHistoryTipsListener();

onBeforeUnmount(() => {
  disposeHistoryTipsListener();
});

const { playerContainerStyle } = usePortraitPlayerSize();

const playerButtonStyle = computed<CSSProperties>(() => {
  if (isDocMainScreen.value && documentSwitch.value) {
    return {
      ...playerContainerStyle.value,
      height: `${portraitDocWrapHeight.value}px`,
    };
  } else {
    return playerContainerStyle.value;
  }
});

const allPlayerContainerStyle = computed<CSSProperties>(() => {
  const style = {
    ...unref(playerContainerStyle),
  };

  let resolutionProportion: number | undefined;
  if (resolutionHeight.value && resolutionWidth.value) {
    resolutionProportion = resolutionHeight.value / resolutionWidth.value;
  }

  // 流比例超过 4:3（高：宽）
  const resolutionRule = resolutionProportion && resolutionProportion > 1.3;
  // 客户端推流或者处于回放状态
  const liveStatusRule =
    (channelStore.liveStatus === LiveStatus.Live &&
      channelStore.currentStreamType === StreamType.Client) ||
    channelStore.liveStatus === LiveStatus.Playback;
  // 显示了文档
  const docRule = unref(portraitDocWrapHeight) > 0;

  // 规则成立时，需要向上移动，才能让画面展示得比较好，247/288 是设计方案如此
  if (resolutionRule && liveStatusRule && docRule) {
    style.marginTop = `-${unref(portraitDocWrapHeight) * (247 / 288)}px`;
  }

  return style;
});

const { toggleFullscreen, supportFullscreen } = useFullscreen(() => {
  const videos =
    playerContainer.value?.querySelectorAll('video') || ([] as unknown as HTMLElement[]);

  let fullscreenElem: HTMLElement | undefined;
  /**
   * 由于低延迟 FLV 下会出现 2 个 video 标签
   * 多余的 video 会设置 display:none;
   * 这里优先使用显示中的 video 标签进行全屏
   */
  videos.forEach(elem => {
    if (elem.clientWidth && elem.clientHeight) {
      fullscreenElem = elem;
    }
  });

  return fullscreenElem as FullscreenElement;
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

useConnectMicing();
</script>

<style lang="scss">
@import './_styles/cover-player-style.scss';

.c-portrait-player-main {
  position: relative;
  width: 100%;
  height: 100%;

  &.c-portrait-player-main--hide {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    pointer-events: none;
    visibility: hidden;
  }
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

.c-portrait-player-main__player-sdk-load-error {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  line-height: 16px;
  color: #fff;
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

.c-portrait-player-main--hide-loading {
  .vcp-loading {
    display: none !important;
  }
}

.c-portrait-player-main--guide-portrait-stream-fit {
  .plvideo video {
    object-fit: cover;
  }
}
</style>
