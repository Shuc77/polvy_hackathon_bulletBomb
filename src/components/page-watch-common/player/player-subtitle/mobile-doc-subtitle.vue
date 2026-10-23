<!-- @file 移动端横屏，文档区字幕显示区 -->

<template>
  <!-- 回放字幕优先；回放页拖动进度条时由播放器时间驱动字幕切换 -->
  <player-replay-subtitle
    v-if="replaySubtitleVisible"
    :selector="selector"
    :full-screen-selector="selector"
    :bottom="16"
    :max-len="80"
    :init-to-player="false"
  />

  <!-- 直播实时字幕  -->
  <player-live-subtitle
    v-else-if="liveSubtitlesShow"
    :full-screen-selector="selector"
    :selector="selector"
    :bottom="16"
    :max-len="80"
    :init-to-player="false"
  />
</template>

<script setup lang="ts">
import PlayerLiveSubtitle from './_components/player-live-subtitle.vue';
import PlayerReplaySubtitle from './_components/player-replay-subtitle.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { MOBILE_DOC_PPT_INNER } from '@/assets/constants/selector';
import { PropUtils } from '@polyv/vue-components';

defineProps({
  /** 挂载选择器 */
  selector: PropUtils.string.def(MOBILE_DOC_PPT_INNER),
});

const { liveSubtitlesShow, replaySubtitleVisible } = storeDefinitionToRefs(useSubtitleStore);
</script>
