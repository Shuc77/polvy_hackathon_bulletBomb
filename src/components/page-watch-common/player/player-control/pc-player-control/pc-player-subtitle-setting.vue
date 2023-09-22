<!-- @file PC 端字幕相关配置 -->

<template>
  <!-- 直播实时字幕配置 -->
  <div
    v-if="liveSubtitlesEnable"
    class="c-player-subtitle-setting-section"
  >
    <div class="c-player-subtitle-setting-section-title">
      {{ $lang('player.subtitle.text') }}
    </div>
    <plv-switch
      :value="localUerSubtitlesEnable"
      @change="changeSubtitleSwitch"
    ></plv-switch>
  </div>

  <!-- 回放字幕配置 -->
  <div
    v-else-if="replaySubtitleVisible"
    class="c-player-subtitle-setting-section"
  >
    <div class="c-player-subtitle-setting-section-title">
      {{ $lang('player.replaySubtitle.text') }}
    </div>

    <template v-for="item of replaySubtitleList">
      <plv-checkbox
        v-if="ynToBool(item.isOriginal)"
        :key="item.id"
        class="c-player-subtitle-setting-section-check"
        :checked="mainReplaySubtitleShow"
        @change="changeMainSubtitleShow"
      >
        {{ item.name || $lang('subtitle.source') }}
      </plv-checkbox>
      <plv-checkbox
        v-else
        :key="item.id"
        class="c-player-subtitle-setting-section-check"
        :checked="subReplaySubtitleShow"
        @change="changeSubSubtitleShow"
      >
        {{ item.name || $lang('subtitle.translate') }}
      </plv-checkbox>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PlvSwitch } from '@/plugins/polyv-ui/pc-import';
import { PlvCheckbox } from '@/plugins/polyv-ui/admin-import';
import { ynToBool } from '@polyv/utils/es/boolean';
import { getWatchCore } from '@/core/watch-sdk';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useSubtitleStore } from '@/store/use-subtitle-store';

const {
  liveSubtitlesEnable,
  localUerSubtitlesEnable,

  mainReplaySubtitleShow,
  subReplaySubtitleShow,
} = storeDefinitionToRefs(useSubtitleStore);

const { replaySubtitleVisible, replaySubtitleList } = storeDefinitionToRefs(usePlaybackStore);

const {
  changeLocalUerSubtitlesEnable,

  changeMainSubtitleShow,
  changeSubSubtitleShow,
} = useSubtitleStore();

function changeSubtitleSwitch() {
  const watchCore = getWatchCore();
  const enable = !localUerSubtitlesEnable.value;
  changeLocalUerSubtitlesEnable(enable);
  watchCore.subtitles.changeViewerSubtitleEnable(enable);
}
</script>

<style lang="scss">
.c-player-subtitle-setting-section {
  .plv-switch {
    background: #545c6b;
  }
  .plv-switch--switched {
    background: #1755ee;
  }
}

.c-player-subtitle-setting-section-title {
  margin-bottom: 16px;
  font-size: 14px;
}

.c-player-subtitle-setting-section-check {
  display: flex;
  align-items: center;
  height: 24px;
  .plv-admin-icon-check {
    background: #1755ee;
  }
  .plv-checkbox__label {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: #fff;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
