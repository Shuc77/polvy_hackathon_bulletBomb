<!-- @file PC 端播放器 -->
<template>
  <div
    class="c-mobile-player-main"
    :class="{
      'c-mobile-player-main--page-fullscreen': mobilePlayerIsPageFullscreen,
      'c-mobile-player-main--screen__horizontal': isHorizontalScreenOrientation,
      'c-mobile-player-main--hide-loading': isAndroid && isDingTalk,
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

    <!-- 观看次数 -->
    <div
      v-if="pageViewCountLocation === PageViewShowLocation.Player && !isLowLatency"
      class="c-mobile-player-main__pv"
    >
      {{ shortNumber(pageViewCount) }} {{ $lang('watch.pvSuffix') }}
    </div>

    <!-- 播放器暖场/封面图  -->
    <mobile-player-cover-img v-if="isLowLatency" />

    <!-- “立即观看”播放按钮 -->
    <player-play-button
      v-if="isLowLatency"
      :mode="PlayButtonMode.Text"
      class="c-mobile-player-main__play-btn"
    />

    <!-- 播放器控制栏 -->
    <mobile-player-control
      v-if="isLowLatency"
      class="c-mobile-player-main__control"
    />

    <!-- 延迟模式切换 -->
    <mobile-low-latency-switch v-show="latencyModeSettingVisible && playerControlVisible" />

    <!-- 播放器弹幕设置面板 -->
    <mobile-barrage-setting
      v-show="barrageSettingVisible"
      @close-setting="handleToggleBarrageSettingVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { unref } from 'vue';

import { appEvents, eventBus } from '@/app/app-events';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';

import PlayerPlayButton from '../../common/player-play-button/player-play-button.vue';
import { PlayButtonMode } from '../../common/player-play-button/use-player-play-button';
import MobilePlayerCoverImg from '../../player-cover-img/mobile-player-cover-img.vue';
import MobilePlayerControl from '../../player-control/mobile-player-control/mobile-player-control.vue';
import MobileLowLatencySwitch from '../../player-control/mobile-player-control/mobile-low-latency-switch.vue';
import MobilePlayerLogo from '@/components/page-watch-common/player/player-logo/mobile-player-logo.vue';
import MobileBarrageSetting from '../../player-control/mobile-player-control/mobile-barrage-setting.vue';

import { shortNumber } from '@/assets/utils/number';
import { PageViewShowLocation } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '../../hooks/use-player-action';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';

const { mobilePlayerIsPageFullscreen, isHorizontalScreenOrientation } =
  storeDefinitionToRefs(useLayoutStore);

const { isLowLatency, playerControlVisible, logoSetting, barrageSettingVisible } =
  storeDefinitionToRefs(usePlayerStore);

const { pageViewCountLocation, pageViewCount } = storeDefinitionToRefs(useChannelInfoStore);

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      showController: !unref(isLowLatency),
      skinConfig: {
        bgColor: '#2B3045',
        streamPause: require('../../imgs/player-stop.png'),
        streamStop: require('../../imgs/player-no-live.png'),
        audioMode: require('../../imgs/player-audio-mode.png'),
      },
    };
  },
});

const { latencyModeSettingVisible, bigPlayButtonVisible } = usePlayerControl();
const { toTogglePlay } = usePlayerAction();

function onClickContainer() {
  if (bigPlayButtonVisible.value) {
    toTogglePlay();
  }
  eventBus.$emit(appEvents.player.ClickMobilePlayerContainer);
}

function handleToggleBarrageSettingVisible() {
  usePlayerStore().$patch({
    barrageSettingVisible: false,
  });
}
</script>

<style lang="scss">
.c-mobile-player-main {
  position: relative;
  width: 100%;
  height: 100%;
  // overflow: hidden;
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

.c-mobile-player-main--page-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2000;
  width: 100vh !important;
  height: 100vw !important;
  margin-top: -50vw;
  margin-left: -50vh;
  transform: rotate3d(0, 0, 1, 90deg) !important;
  transform: rotate(90deg);
  transform-origin: center center;
}
.c-mobile-player-main--screen__horizontal {
  position: fixed;
  top: 0 !important;
  left: 0 !important;
  z-index: 2000;
  width: 100vw !important;
  height: 100% !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  transform: rotate(0deg) !important;
  transform-origin: center center;
}

.c-mobile-player-main--hide-loading {
  .vcp-loading {
    display: none !important;
  }
}
</style>
