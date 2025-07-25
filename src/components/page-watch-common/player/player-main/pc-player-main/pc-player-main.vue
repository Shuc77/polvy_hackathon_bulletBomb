<!-- @file PC 端播放器 -->
<template>
  <div
    class="c-pc-player-main"
    :class="{
      'c-pc-player-main__hide': isConnectMicing,
      'c-pc-player-main--new-play-btn': newPlayerPauseStyleEnabled,
    }"
  >
    <!-- 播放器渲染容器 -->
    <div
      ref="playerContainer"
      class="c-pc-player-main__container"
      @click="toTogglePlayInLimit"
    ></div>

    <div
      v-if="playerSdkLoadError"
      class="c-pc-player-main__player-sdk-load-error"
    >
      {{ $lang('player.error.sdkLoad') }}
    </div>

    <!-- 播放器 logo -->
    <pc-player-logo v-if="isLowLatency && logoSetting.logoImage" />

    <!-- 播放器封面图 -->
    <pc-player-cover-img />

    <!-- 视频区播放按钮，仅用来展示 -->
    <player-play-button :mode="noPauseWhenLive ? PlayButtonMode.Text : PlayButtonMode.Default" />

    <!-- 播放器字幕区 -->
    <player-subtitle />
  </div>
</template>

<script setup lang="ts">
import { usePlayerMain } from '@/components/page-watch-common/player/hooks/use-player-main';

import PcPlayerCoverImg from '@/components/page-watch-common/player/player-cover-img/pc-player-cover-img.vue';
import PlayerPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-button.vue';
import { PlayButtonMode } from '@/components/page-watch-common/player/common/player-play-button/use-player-play-button';
import PcPlayerLogo from '@/components/page-watch-common/player/player-logo/pc-player-logo.vue';
import PlayerSubtitle from '@/components/page-watch-common/player/player-subtitle/pc-player-subtitle.vue';

import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerKeyboard } from '@/components/page-watch-common/player/hooks/use-player-keyboard';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useConnectMicing } from '../../hooks/use-connect-micing';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePlayerStreamStopText } from '@/components/page-watch-common/player/hooks/use-player-stream-stop-text';

const {
  playerSdkLoadError,

  isLowLatency,
  logoSetting,
  newPlayerPauseStyleEnabled,
} = storeDefinitionToRefs(usePlayerStore);

const { isConnectMicing } = storeDefinitionToRefs(useConnectMicStore);

const { getStreamStopText, isEnableDirectPlayCutOff } = usePlayerStreamStopText();

const { playerContainer } = usePlayerMain({
  initPlayerOptions: () => {
    return {
      barrageEnabled: false,
      showController: false,
      skinConfig: {
        streamStopTxt: getStreamStopText(),
        bgColor: '#2B3045',
        streamPause: require('../../imgs/player-stop.png'),
        streamStop: require('../../imgs/player-no-live.png'),
        audioMode: require('../../imgs/player-audio-mode.png'),
      },
      directPlayCutOff: isEnableDirectPlayCutOff.value,
    };
  },
});

const { noPauseWhenLive } = usePlayerControl();

usePlayerKeyboard(playerContainer);

const { toTogglePlayInLimit } = usePlayerAction();

useConnectMicing();
</script>

<style lang="scss">
@import './styles/cover-pc-player.scss';

.c-pc-player-main {
  position: relative;
  width: 100%;
  height: 100%;

  &.c-pc-player-main__hide {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    height: 1px;
    opacity: 0;
    .plv-watch-sdk__player-wrap-volc {
      > div {
        font-size: 0;
      }
    }
  }
}

.c-pc-player-main__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-pc-player-main__player-sdk-load-error {
  position: absolute;
  top: 50%;
  left: 50%;
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
  pointer-events: none;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.c-pc-player-main--new-play-btn {
  .pv-video-player {
    .pv-icon-btn-play {
      opacity: 0;
    }
  }
}
</style>
