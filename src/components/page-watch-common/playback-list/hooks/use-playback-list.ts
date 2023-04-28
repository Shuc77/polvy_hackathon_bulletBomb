import { getWatchCore } from '@/core/watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { PlaybackTarget } from '@polyv/live-watch-sdk';

export const usePlaybackList = () => {
  const playbackStore = usePlaybackStore();

  /**
   * 处理点击回放节点
   */
  async function onClickPlaybackItem(target: PlaybackTarget) {
    const watchCore = getWatchCore();
    playbackStore.$patch({
      currentPlaybackTarget: target,
    });
    await watchCore.player.changePlayback(target.playbackOptions);
    watchCore.player.play();
  }

  return {
    onClickPlaybackItem,
  };
};
