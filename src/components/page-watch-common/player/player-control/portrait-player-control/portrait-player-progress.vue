<!-- @file 竖屏端播放器进度条 -->
<template>
  <div class="c-portrait-player-progress">
    <!-- 播放暂停按钮 -->
    <div
      class="c-portrait-player-progress__button g-img-contain"
      :class="{
        'c-portrait-player-progress__button--pause': playStatus === PlayStatus.Playing,
      }"
      @click="toTogglePlay"
    ></div>

    <!-- 当前播放时间 -->
    <div class="c-portrait-player-progress__time">
      <span>{{ formatSeconds(currentTime, { segments: 3 }) }}</span>
    </div>

    <!-- 进度条 -->
    <div class="c-portrait-player-progress__main">
      <slider-bar
        wrap-slider-track-color="rgba(255, 255, 255, 0.4)"
        inner-slider-track-color="#FFC815"
        :slider-track-size="2"
        :slider-dot-size="12"
        :max="durationTime"
        :value="currentTime"
        @drag-change="toSeekVideo"
      />
    </div>

    <!-- 总时长 -->
    <div class="c-portrait-player-progress__time">
      <span>{{ formatSeconds(durationTime, { segments: 3 }) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import { formatSeconds } from '@utils-ts/date';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerAction } from '../../hooks/use-player-action';

const { playStatus, currentTime, durationTime } = storeDefinitionToRefs(usePlayerStore);

const { toSeekVideo, toTogglePlay } = usePlayerAction();
</script>

<style lang="scss">
.c-portrait-player-progress {
  display: flex;
  align-items: center;
  height: 32px;
}
.c-portrait-player-progress__button {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-right: 16px;
  background-image: url(../../imgs/icon-play.png);
}
.c-portrait-player-progress__button--pause {
  background-image: url(../../imgs/icon-pause.png);
}
.c-portrait-player-progress__time {
  white-space: nowrap;
}
.c-portrait-player-progress__main {
  flex: 1;
  margin-right: 16px;
  margin-left: 16px;
}
</style>
