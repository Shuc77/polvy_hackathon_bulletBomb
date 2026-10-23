<!-- @file PC 端播放器字幕显示区 -->

<template>
  <!-- 回放字幕优先；回放页拖动进度条时由播放器时间驱动字幕切换 -->
  <player-replay-subtitle
    v-if="replaySubtitleVisible"
    :full-screen-selector="PC_PLAYER_FULL_SCREEN_SELECTOR"
    :selector="PC_MAIN_PLAYER_SELECTOR"
    :init-to-player="true"
    :bottom="106"
  />
  <!-- 直播实时字幕  -->
  <player-live-subtitle
    v-else-if="showLiveTermSubtitle"
    :full-screen-selector="PC_PLAYER_FULL_SCREEN_SELECTOR"
    :selector="PC_MAIN_PLAYER_SELECTOR"
    :init-to-player="true"
    :bottom="106"
  />
</template>

<script setup lang="ts">
import PlayerLiveSubtitle from './_components/player-live-subtitle.vue';
import PlayerReplaySubtitle from './_components/player-replay-subtitle.vue';

import { computed } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { isTermDemoEnabled } from '@/core/term/term-options';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import {
  PC_PLAYER_FULL_SCREEN_SELECTOR,
  PC_MAIN_PLAYER_SELECTOR,
} from '@/assets/constants/selector';

const { liveSubtitlesEnable, replaySubtitleVisible } = storeDefinitionToRefs(useSubtitleStore);

const termDemoEnabled = isTermDemoEnabled();
const showLiveTermSubtitle = computed(() => liveSubtitlesEnable.value || termDemoEnabled);
</script>
