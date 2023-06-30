import { appEvents, eventBus } from '@/app/app-events';
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

    // 聊天重放需要重新渲染聊天列表
    if (playbackStore.chatReplayEnabled) {
      watchCore.chat.setChatMsgReplayPlaybackTarget(target);
      eventBus.$emit(appEvents.chat.ResetUpChatMsgList);
    }

    await watchCore.player.changePlayback(target.playbackOptions);
    watchCore.player.play();
  }

  return {
    onClickPlaybackItem,
  };
};
