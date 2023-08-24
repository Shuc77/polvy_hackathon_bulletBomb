<!-- @file 移动端播放器封面图 -->
<template>
  <div
    class="c-mobile-player-cover-img"
    :class="{
      'c-pc-player-cover-img__prevent-player-click': preventPlayerClick,
    }"
  >
    <!-- 暖场图/播放器封面图 -->
    <div
      v-if="warmUpSetting.warmUpImg"
      v-show="showWarmUpImg"
      class="c-mobile-player-cover-img__warm-up-img g-img-cover"
      :style="{
        backgroundImage: `url(${warmUpSetting.warmUpImg})`,
      }"
    ></div>
    <!-- 音频直播下占位图-直播封面图 -->
    <player-audio-live-placeholder
      v-show="showAudioLivePlaceholder"
      class="c-mobile-player-cover-img__audio-cover-img"
      use-splash-img
    />
    <!-- 研讨会频道-主持进入分组讨论占位图 -->
    <div
      v-show="isSeminarHostInGroup"
      class="c-mobile-player-cover-img__seminar__hostInGroup"
    >
      <p>{{ $lang('seminar.hostInGroup') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PlayerAudioLivePlaceholder from '@/components/common-business/player/player-audio-live-placeholder.vue';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';

const {
  showWarmUpImg,
  warmUpSetting,

  showAudioLivePlaceholder,
} = storeDefinitionToRefs(usePlayerStore);
const { isSeminarHostInGroup } = storeDefinitionToRefs(useChannelStore);

const preventPlayerClick = computed(() => {
  if (isSeminarHostInGroup.value) return true;

  return false;
});
</script>

<style lang="scss">
.c-mobile-player-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.c-pc-player-cover-img__prevent-player-click {
  pointer-events: visible;
}

.c-mobile-player-cover-img__warm-up-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-mobile-player-cover-img__audio-cover-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.c-mobile-player-cover-img__seminar__hostInGroup {
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
