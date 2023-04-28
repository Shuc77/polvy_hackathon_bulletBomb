<!-- @file PC 端播放器 -->
<template>
  <div class="c-pc-player-main">
    <!-- 播放器渲染容器 -->
    <div
      ref="playerContainer"
      class="c-pc-player-main__container"
      @click="toTogglePlay"
    ></div>

    <!-- 播放器 logo -->
    <pc-player-logo v-if="isLowLatency && logoImage" />

    <!-- 播放器封面图 -->
    <pc-player-cover-img />

    <!-- 视频区播放按钮 -->
    <player-play-button />
  </div>
</template>

<script setup lang="ts">
import { usePlayerMain } from '@/components/page-watch-common/player/hooks/use-player-main';

import PcPlayerCoverImg from '@/components/page-watch-common/player/player-cover-img/pc-player-cover-img.vue';
import PlayerPlayButton from '@/components/page-watch-common/player/common/player-play-button/player-play-button.vue';
import PcPlayerLogo from '@/components/page-watch-common/player/player-logo/pc-player-logo.vue';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { usePlayerKeyboard } from '@/components/page-watch-common/player/hooks/use-player-keyboard';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { playerContainer } = usePlayerMain({
  initPlayerOptions: {
    showController: false,
    barrageAutoAdd: false,
    skinConfig: {
      bgColor: '#2B3045',
      streamPause: require('../../imgs/player-stop.png'),
      streamStop: require('../../imgs/player-no-live.png'),
      audioMode: require('../../imgs/player-audio-mode.png'),
    },
  },
});

usePlayerKeyboard(playerContainer);

const { toTogglePlay } = usePlayerAction();

const { isLowLatency, logoImage } = storeDefinitionToRefs(usePlayerStore);
</script>

<style lang="scss">
@import './styles/cover-pc-player.scss';

.c-pc-player-main {
  position: relative;
  width: 100%;
  height: 100%;
}

.c-pc-player-main__container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
