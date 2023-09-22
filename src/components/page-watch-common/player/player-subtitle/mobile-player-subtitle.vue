<!-- @file 移动端横屏播放器字幕显示区 -->

<template>
  <!-- 直播实时字幕  -->
  <player-live-subtitle
    v-if="liveSubtitlesEnable"
    :selector="MOBILE_LIVE_PLAYER_INNER_WRAP"
    :bottom="16"
    :max-len="80"
    :init-to-player="true"
  />

  <!-- 回放字幕 -->
  <player-replay-subtitle
    v-else-if="replaySubtitleVisible"
    :selector="MOBILE_LIVE_PLAYER_INNER_WRAP"
    :bottom="40"
    :max-len="80"
    :init-to-player="true"
  />
</template>

<script setup lang="ts">
import PlayerLiveSubtitle from './_components/player-live-subtitle.vue';
import PlayerReplaySubtitle from './_components/player-replay-subtitle.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { MOBILE_LIVE_PLAYER_INNER_WRAP } from '@/assets/constants/selector';

const { liveSubtitlesEnable } = storeDefinitionToRefs(useSubtitleStore);

const { replaySubtitleVisible } = storeDefinitionToRefs(usePlaybackStore);
</script>
