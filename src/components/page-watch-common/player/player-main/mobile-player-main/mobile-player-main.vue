<!-- @file 移动端横屏播放器 -->
<template>
  <div
    class="c-mobile-player-main"
    :class="{
      'c-mobile-player-main--normal-player-fullscreen': mobileNormalLatencyPlayerIsFullscreen,
      'c-mobile-player-main--page-fullscreen': lowLatencyPlayerIsPageFullscreen,
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

    <div
      v-if="playerSdkLoadError"
      class="c-mobile-player-main__player-sdk-load-error"
    >
      {{ $lang('player.error.sdkLoad') }}
    </div>

    <!-- 播放器 logo -->
    <mobile-player-logo v-if="isLowLatency && logoSetting.logoImage" />

    <!-- 播放器暖场/封面图  -->
    <mobile-player-cover-img />

    <!-- “点击播放”播放按钮，仅用来展示  -->
    <player-play-button
      v-if="isLowLatency || needPlayerBtnForWarmup"
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
    <mobile-player-subtitle
      v-show="mainScreen === MainScreenContent.Player"
      selector=".c-mobile-player-main"
    />

    <!-- ========= 弹出层类型组件 Start ========= -->

    <!-- 播放器弹幕设置面板 -->
    <mobile-barrage-setting v-show="barrageMobileSettingVisible" />

    <!-- 精彩看点弹窗 -->
    <mobile-player-time-axis-mark-popup v-if="supportTimeAxisMark" />

    <!-- 回放字幕切换popup -->
    <mobile-subtitle-select
      v-model="pbSubtitleTranslateLanguage"
      :options="pbSubtitleOptions"
      ref="pbSubtitleSelectRef"
      class="c-mobile-player-playback-subtitle-select"
      @input="handleSelectSubtitle"
    ></mobile-subtitle-select>

    <!-- ========= 弹出层类型组件 End ========= -->
  </div>
</template>

<script setup lang="ts">
import { computed, unref, ref, onBeforeUnmount } from 'vue';

import { appEvents } from '@/app/app-events';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import { usePlayerControl } from '../../hooks/use-player-control';
import { usePlayerMain } from '../../hooks/use-player-main';
import { useConnectMicing } from '../../hooks/use-connect-micing';
import { useMobilePlaybackSubtitle } from '../../../subtitle/use-mobile-playback-subtitle';

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
import MobileSubtitleSelect from '@/components/page-watch-common/subtitle/mobile-subtitle-select/mobile-subtitle-select.vue';

import { MainScreenContent, PageViewShowLocation } from '@polyv/live-watch-sdk';
import { usePlayerAction } from '../../hooks/use-player-action';
import { isAndroid, isDingTalk } from '@/assets/utils/browser';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';
import { ComponentInstance } from '@/hooks/core/use-vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { useShortNumber } from '@/hooks/business/use-short-number';

const { shortNumber } = useShortNumber();

const {
  mainScreen,
  mobilePlayerIsPageFullscreen,
  mobileNormalLatencyPlayerIsFullscreen,
  isHorizontalScreenOrientation,
} = storeDefinitionToRefs(useLayoutStore);

const lowLatencyPlayerIsPageFullscreen = computed(() => {
  return (
    mobilePlayerIsPageFullscreen.value &&
    !mobileNormalLatencyPlayerIsFullscreen.value &&
    !isHorizontalScreenOrientation.value
  );
});

const channelStore = useChannelStore();

const {
  playerSdkLoadError,
  isLowLatency,
  playerControlVisible,
  sdkPlayerUIControlVisible,
  logoSetting,
  barrageMobileSettingVisible,
  supportTimeAxisMark,
  newPlayerPauseStyleEnabled,
  isCdnWithNormalLayout,
  existWarmUpVideo,
  showWarmUpImg,
} = storeDefinitionToRefs(usePlayerStore);

const needPlayerBtnForWarmup = computed(() => {
  return showWarmUpImg.value && existWarmUpVideo.value;
});

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

const { latencyModeSettingVisible, bigPlayButtonVisible, addHistoryTipsListener } =
  usePlayerControl();
const { toPlay } = usePlayerAction();
const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { getEmitter } = useGlobalInject();

const { dispose: disposeHistoryTipsListener } = addHistoryTipsListener();

onBeforeUnmount(() => {
  disposeHistoryTipsListener();
});

function onClickContainer() {
  // 点击播放器容器主要是为了展示控制栏，只有在播放按钮存在时，点击才去播放视频
  // cdn播放器且处于横屏模板时不显示观看页大播放按钮，所以不需要调用toPlay()
  // 存在暖场视频的情况下，需要触发 toPlay 方法
  if (
    bigPlayButtonVisible.value &&
    (!isCdnWithNormalLayout.value || needPlayerBtnForWarmup.value)
  ) {
    toPlay();
  }
  getEmitter().emit(appEvents.player.ClickMobilePlayerContainer);
}

const pbSubtitleSelectRef = ref<ComponentInstance<typeof MobileSubtitleSelect>>();

const { pbSubtitleOptions, pbSubtitleTranslateLanguage, handleSelectSubtitle } =
  useMobilePlaybackSubtitle({
    openSelectAction: () => {
      if (pbSubtitleSelectRef.value) {
        pbSubtitleSelectRef.value.openOption();
      }
    },
  });

useConnectMicing();
</script>

<style lang="scss">
@import './_styles/cover-mobile-player.scss';

$--player-page-fullscreen-width-half: calc($--plv-mobile-watch-full-screen-vw / 2) !default;
$--player-page-fullscreen-height-half: calc($--plv-mobile-watch-full-screen-vh / 2) !default;

// prettier-ignore
$--player-page-fullscreen-width-half__reverse: calc($--player-page-fullscreen-width-half * -1) !default;
// prettier-ignore
$--player-page-fullscreen-height-half__reverse: calc($--player-page-fullscreen-height-half * -1) !default;

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

.c-mobile-player-main__player-sdk-load-error {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 310;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  line-height: 16px;
  color: #fff;
  pointer-events: none;
  cursor: pointer;
  transform: translate(-50%, -50%);
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

// 正常延迟播放器全屏
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
  position: absolute;
  top: $--player-page-fullscreen-height-half;
  bottom: 0 !important;
  left: $--player-page-fullscreen-width-half;

  z-index: 2000;
  width: calc($--plv-mobile-watch-full-screen-vh);
  height: calc($--plv-mobile-watch-full-screen-vw);
  // prettier-ignore
  transform: translate($--player-page-fullscreen-height-half__reverse, $--player-page-fullscreen-width-half__reverse) rotate(90deg);
  transform-origin: center;

  // @include force-page-fullscreen;
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

.c-mobile-player-main__player-tips {
  position: absolute;
  top: 32px;
  left: 50%;
  z-index: 3000;
  transform: translateX(-50%);
}

.c-mobile-player-playback-subtitle-select {
  display: none;
}
</style>
