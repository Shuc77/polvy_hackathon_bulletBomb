<!-- @file 竖屏端播放器封面图 -->
<template>
  <div class="c-portrait-player-cover-img">
    <!-- 暖场图/播放器封面图 -->
    <div
      v-show="showWarmUpImg"
      data-warmup-img
      class="c-portrait-player-cover-img__warm-up-img g-img-cover"
      :style="{
        ...playerContainerStyle,
        backgroundImage: `url(${warmUpImg})`,
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getImgSize } from '@/assets/utils/image';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import {
  PlayerSizeData,
  usePortraitPlayerSize,
} from '../player-main/portrait-player-main/use-portrait-player-size';

const {
  showWarmUpImg,
  warmUpImg,

  showAudioLivePlaceholder,
  isAudioPlayerMode,
} = storeDefinitionToRefs(usePlayerStore);

const imgSize = ref<PlayerSizeData>();
const { playerContainerStyle } = usePortraitPlayerSize(imgSize);

/**
 * 加载暖场图片
 */
async function loadWarmUpImg() {
  if (!warmUpImg.value) {
    return;
  }
  const { width, height } = await getImgSize(warmUpImg.value);

  imgSize.value = {
    width,
    height,
  };
}

onMounted(() => {
  loadWarmUpImg();
});
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
</style>
