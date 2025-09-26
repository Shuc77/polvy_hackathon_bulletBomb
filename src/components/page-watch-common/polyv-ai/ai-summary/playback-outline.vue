<template>
  <div class="c-playback-outline">
    <playback-outline
      :outline-data="outlineData"
      :show-color="false"
      @seek-video="onSeekVideo"
      @open-mind-map="openMindMap"
    />

    <outline-mind-map-ui ref="mindMapRef" />
  </div>
</template>

<script setup lang="ts">
import { useLiveWatchAIUILoader } from '@/plugins/external-lib-loaders/load-ai-ui';
import { usePlaybackOutline } from './use-playback-outline';
import { defineAsyncComponent, ref } from 'vue';
import type { PlaybackOutlineData } from '@polyv/live-watch-sdk';
import { useAIGlobalProvider } from '../use-ai-global-provider';

useAIGlobalProvider();

const { outlineData, onSeekVideo } = usePlaybackOutline();

const { loadLiveWatchAIUIComponent } = useLiveWatchAIUILoader();

const PlaybackOutline = defineAsyncComponent(() => loadLiveWatchAIUIComponent('PlaybackOutline'));

const OutlineMindMapUi = defineAsyncComponent(() => loadLiveWatchAIUIComponent('OutlineMindMap'));

const mindMapRef = ref();

/** 打开思维导图 */
function openMindMap(data: PlaybackOutlineData) {
  mindMapRef.value?.openMindMap(data);
}
</script>

<style lang="scss">
.c-playback-outline {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
