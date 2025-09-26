import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';
import { ref, watch } from 'vue';
import { usePlayerAction } from '../../player/hooks/use-player-action';
import type { PlaybackOutlineData } from '@polyv/live-watch-sdk';

export const usePlaybackOutline = () => {
  const { getWatchCore } = useGlobalInject();

  const { toSeekVideo } = usePlayerAction();

  const watchCore = getWatchCore();

  const playbackStore = usePlaybackStore();

  const outlineData = ref<PlaybackOutlineData>();

  /**
   * 获取 AI 回放大纲
   */
  async function getOutlineData() {
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget || !playbackTarget.outline?.outlineUrl) {
      outlineData.value = undefined;
      return;
    }

    const data = await watchCore.playback.getOutlineList(playbackTarget.outline.outlineUrl);
    outlineData.value = data;
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getOutlineData();
    },
    {
      immediate: true,
    },
  );

  function onSeekVideo(time: number) {
    toSeekVideo(time);
  }

  return {
    outlineData,
    onSeekVideo,
  };
};
