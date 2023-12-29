<!-- @file 移动端横屏播放器 -->
<template>
  <div
    class="c-mobile-player-main"
    :class="{
      'c-mobile-player-main--normal-player-fullscreen': mobileNormalLatencyPlayerIsFullscreen,
      'c-mobile-player-main--page-fullscreen':
        mobilePlayerIsPageFullscreen && !isHorizontalScreenOrientation,
      'c-mobile-player-main--screen__horizontal': isHorizontalScreenOrientation,
      'c-mobile-player-main--hide-loading': isAndroid && isDingTalk,
      'c-mobile-player-main--hide': isConnectMicing,
      'c-mobile-player-main--new-play-btn': newPlayerPauseStyleEnabled,
    }"
    @click="onClickContainer"
  >
    <!-- 播放器渲染容器 -->
    <div
      ref="playerContainer"
      class="c-mobile-player-main__container"
    ></div>

    <!-- 播放器 logo -->
    <mobile-player-logo v-if="isLowLatency && logoSetting.logoImage" />

    <!-- 播放器暖场/封面图  -->
    <mobile-player-cover-img />

    <!-- “立即观看”播放按钮，仅用来展示  -->
    <player-play-button
      v-if="isLowLatency"
      :mode="PlayButtonMode.Text"
      class="c-mobile-player-main__play-btn"
    />

    <!-- 播放器顶部-左侧 访问次数 -->
    <div
      v-if="pvShowEnabled && pageViewCountLocation === PageViewShowLocation.Player"
      v-show="playerControlVisible || sdkPlayerUIControlVisible"
      class="c-mobile-player-main__pv"
    >
      {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
    </div>

    <!-- 播放器顶部-右侧 延迟模式切换 -->
    <mobile-low-latency-switch
      v-show="latencyModeSettingVisible && (playerControlVisible || sdkPlayerUIControlVisible)"
    />

    <!-- 播放器底部-右侧 直播时移和精彩看点入口 -->
    <transition name="slide">
      <mobile-player-time-axis-entrance
        v-if="isLowLatency"
        v-show="playerControlVisible"
      />
    </transition>

    <!-- 播放器控制栏 -->
    <mobile-player-control
      v-if="isLowLatency"
      class="c-mobile-player-main__control"
    />

    <!-- 播放器字幕区 -->
    <mobile-player-subtitle />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 播放器弹幕设置面板 -->
    <mobile-barrage-setting v-show="barrageMobileSettingVisible" />

    <!-- 精彩看点弹窗 -->
    <mobile-player-time-axis-mark-popup v-if="supportTimeAxisMark" />

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import { unref } from 'vue';

import { appEvents, eventBus } from '@/app/app-events';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';
import { useConnectMicing } from '../../hooks/use-connect-micing';

import PlayerPlayButton from '../../common/player-play-button/player-play-button.vue';
import { PlayButtonMode } from '../../common/player-play-button/use-player-play-button';
import MobilePlayerCoverImg from '../../player-cover-img/mobile-player-cover-img.vue';
import MobilePlayerControl from '../../player-control/mobile-player-control/mobile-player-control.vue';
import MobileLowLatencySwitch from '../../player-control/mobile-player-control/mobile-low-latency-switch.vue';
import MobilePlayerLogo from '@/components/page-watch-common/player/player-logo/mobile-player-logo.vue';
import MobileBarrageSetting from '../../player-control/mobile-player-control/mobile-barrage-setting.vue';
import MobilePlayerTimeAxisEntrance from '../../player-time-axis-mark/mobile-player-time-axis-entrance.vue';
import MobilePlayerTimeAxisMarkPopup from '../../player-time-axis-mark/mobile-player-time-axis-mark-popup.vue';
import MobilePlayerSubtitle from '@/components/page-watch-common/player/player-subtitle/mobile-player-subtitle.vue';

import { shortNumber } from '@/assets/utils/number';
import { PageViewShowLocation } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '../../hooks/use-player-action';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';

const {
  mobilePlayerIsPageFullscreen,
  mobileNormalLatencyPlayerIsFullscreen,
  isHorizontalScreenOrientation,
} = storeDefinitionToRefs(useLayoutStore);

const channelStore = useChannelStore();

const {
  isLowLatency,
  playerControlVisible,
  sdkPlayerUIControlVisible,
  logoSetting,
  barrageMobileSettingVisible,
  supportTimeAxisMark,
  newPlayerPauseStyleEnabled,
} = storeDefinitionToRefs(usePlayerStore);

const { pvShowEnabled, pageViewCountLocation, pageViewCount } =
  storeDefinitionToRefs(useChannelInfoStore);

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      showController: !unref(isLowLatency),
      skinConfig: {
        streamStopTxt: channelStore.privateSeminarChannel
          ? translate('seminar.noLive')
          : translate('channel.noLive'),
        bgColor: '#2B3045',
        streamPause: require('../../imgs/player-stop.png'),
        streamStop: require('../../imgs/player-no-live.png'),
        audioMode: require('../../imgs/player-audio-mode.png'),
      },
    };
  },
});

const { latencyModeSettingVisible, bigPlayButtonVisible } = usePlayerControl();
const { toPlay } = usePlayerAction();
const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

function onClickContainer() {
  // 点击播放器容器主要是为了展示控制栏，只有在播放按钮存在时，点击才去播放视频
  if (bigPlayButtonVisible.value) {
    toPlay();
  }
  eventBus.$emit(appEvents.player.ClickMobilePlayerContainer);
}

useConnectMicing();
</script>

<style lang="scss">
$--player-page-fullscreen-width: $--plv-mobile-watch-full-screen-vh !default;
$--player-page-fullscreen-margin-left: calc(($--plv-mobile-watch-full-screen-vh / 2) * -1) !default;

.c-mobile-player-main {
  position: absolute;
  width: 100%;
  height: 100%;
  // overflow: hidden;

  &.c-mobile-player-main--hide {
    top: 0;
    left: 0;
    z-index: -1;
    pointer-events: none;
    visibility: hidden;
  }
}

.c-mobile-player-main__play-btn {
  z-index: 310;
}

.c-mobile-player-main__container {
  position: absolute;
  top: 0;
  left: 0;
  // z-index: 300;
  width: 100%;
  height: 100%;
}

.c-mobile-player-main__pv {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 308;
  padding: 0 8px;
  font-size: 12px;
  line-height: 24px;
  color: #fff;
  background: #000;
  border-radius: 12px;
  opacity: 0.7;
}

// 正常延迟播放器页面全屏
.c-mobile-player-main--normal-player-fullscreen {
  .plv-live-fullscreen--landscape {
    // ios 兼容处理
    .plvideo {
      z-index: -1;
    }
  }
}

// 无延迟播放器页面全屏
.c-mobile-player-main--page-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2000;
  width: $--player-page-fullscreen-width !important;
  height: 100vw !important;
  margin-top: -50vw;
  margin-left: $--player-page-fullscreen-margin-left !important;
  transform: rotate3d(0, 0, 1, 90deg) !important;
  transform-origin: center center;

  // ios 兼容处理
  .c-mobile-player-main__container {
    z-index: -1;
  }
}

// 屏幕横屏
.c-mobile-player-main--screen__horizontal {
  width: $--plv-mobile-watch-full-screen-vw !important;
  height: 100% !important;
}

.c-mobile-player-main--hide-loading {
  .vcp-loading {
    display: none !important;
  }
}

.c-mobile-player-main--new-play-btn {
  .plv-live-cover__btn,
  .plv-live-big-play-btn,
  .plv-player-big-play-btn {
    background: url('../../common/player-play-button/imgs/play-btn-3.svg') no-repeat;
    background-position: center;
    background-size: 70px;
  }
}
</style>
