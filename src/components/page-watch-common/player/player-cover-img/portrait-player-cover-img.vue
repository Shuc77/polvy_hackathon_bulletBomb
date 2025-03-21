<!-- @file 竖屏端播放器封面图 -->
<template>
  <div class="c-portrait-player-cover-img">
    <!-- 暖场图/播放器封面图 -->
    <div
      v-if="warmUpRenderCover"
      v-show="showWarmUpImg"
      data-warmup-img
      class="c-portrait-player-cover-img__warm-up-img g-img-cover"
      :style="{
        ...playerContainerStyle,
        backgroundImage: `url(${warmUpRenderCover})`,
      }"
    ></div>
    <!-- 音频直播下占位图-直播封面图 -->
    <player-audio-live-placeholder
      v-show="showAudioLivePlaceholder && !isAudioPlayerMode"
      class="c-portrait-player-cover-img__audio-cover-img"
      :style="{
        ...playerContainerStyle,
      }"
    />
    <!-- 音视频切换——音频模式占位图 -->
    <portrait-audio-panel
      v-if="isAudioPlayerMode"
      :style="{
        ...playerContainerStyle,
      }"
    />
    <!-- 研讨会频道-主持进入分组讨论占位图 -->
    <div
      v-show="isSeminarHostInGroup"
      class="c-portrait-player-cover-img__seminar__hostInGroup"
      :style="{
        ...playerContainerStyle,
      }"
    >
      <p>{{ $lang('seminar.hostInGroup') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { getImgSize } from '@/assets/utils/image';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';
import PortraitAudioPanel from '../common/audio-panel/portrait-audio-panel.vue';

import { usePortraitPlayerSize } from '../player-main/portrait-player-main/use-portrait-player-size';
import { useChannelStore } from '@/store/use-channel-store';

const {
  showWarmUpImg,
  warmUpRenderCover,

  showAudioLivePlaceholder,
  isAudioPlayerMode,
} = storeDefinitionToRefs(usePlayerStore);

const { isSeminarHostInGroup } = storeDefinitionToRefs(useChannelStore);

const { setTargetSize, playerContainerStyle } = usePortraitPlayerSize();

/**
 * 加载暖场图片
 */
watch(
  () => warmUpRenderCover.value,
  async () => {
    if (!warmUpRenderCover.value) {
      return;
    }

    const { width, height } = await getImgSize(warmUpRenderCover.value);

    const imgSize = {
      width,
      height,
    };

    setTargetSize(imgSize);
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.c-portrait-player-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-portrait-player-cover-img__warm-up-img {
  position: absolute;
}

.c-portrait-player-cover-img__audio-cover-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-portrait-player-cover-img__seminar__hostInGroup {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  font-size: 18px;
  color: rgba(#fff, 0.6);
  text-align: center;

  background: #272832;
}
</style>
