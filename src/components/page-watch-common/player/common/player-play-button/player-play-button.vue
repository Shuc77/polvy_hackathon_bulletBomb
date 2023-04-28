<!-- @file 播放器的播放大按钮 -->
<template>
  <div
    v-if="bigPlayButtonVisible"
    class="c-player-play-button"
    :class="{
      'c-player-play-button--light': showWarmUpImg || isTextMode,
    }"
  >
    <div
      v-if="isTextMode"
      class="c-player-play-button__mode--text"
    >
      <img src="./imgs/play-btn-prefix.gif" />
      <span>{{ $lang('player.play.button.text') }}</span>
    </div>
    <div
      v-else
      class="c-player-play-button__mode--default"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';

import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { usePlayerPlayButtonProps, PlayButtonMode } from './use-player-play-button';

const props = defineProps(usePlayerPlayButtonProps());

const { bigPlayButtonVisible } = usePlayerControl();

const { showWarmUpImg } = storeDefinitionToRefs(usePlayerStore);

const isTextMode = computed(() => {
  return props.mode === PlayButtonMode.Text;
});
</script>

<style lang="scss">
.c-player-play-button {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none;
  cursor: pointer;
  background: rgba(#000, 0.8);
}

.c-player-play-button--light {
  background: none;
}

.c-player-play-button__mode--default {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 128px;
  max-width: 22%;
  pointer-events: none;
  transform: translate(-50%, -50%);

  &::after {
    display: block;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    content: '';

    background-image: url(./imgs/play-btn.png);
    background-size: 100% 100%;
  }
}

.c-player-play-button__mode--text {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 40px;
  color: $--color-white;
  letter-spacing: 0;
  white-space: nowrap;

  background: rgba(#000000, 0.8);
  border: 1px solid rgba(#fff, 0.6);
  border-radius: 20.5px;
  transform: translate(-50%, -50%);

  img {
    width: 24px;
    height: 24px;
    margin-top: -8px;
    margin-right: 4px;
  }
}
</style>
