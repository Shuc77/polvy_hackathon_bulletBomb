<!-- @file PC 端播放器封面图 -->
<template>
  <div class="c-pc-player-cover-img">
    <!-- 暖场图/播放器封面图 -->
    <div
      v-show="showWarmUpImg && liveStatus === LiveStatus.Live"
      class="c-pc-player-cover-img__warm-up-img g-img-cover"
      :style="{
        backgroundImage: `url(${warmUpImg})`,
      }"
    ></div>
    <!-- 音频直播下占位图-直播封面图 -->
    <player-audio-live-placeholder
      v-show="showAudioLivePlaceholder"
      class="c-pc-player-cover-img__audio-cover-img"
      use-splash-img
    />
  </div>
</template>

<script setup lang="ts">
import { LiveStatus } from '@polyv/live-watch-sdk';

import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';

const {
  showWarmUpImg,
  warmUpImg,

  showAudioLivePlaceholder,
} = storeDefinitionToRefs(usePlayerStore);

const { liveStatus } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-pc-player-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.c-pc-player-cover-img__warm-up-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-pc-player-cover-img__audio-cover-img {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
