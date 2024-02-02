import { watch, nextTick } from 'vue';
import { usePlayerStore } from '@/store/use-player-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { isMobile } from '@/assets/utils/browser';

const useConnectMicingPlayerHelper = () => {
  const playerStore = usePlayerStore();

  const { toPlay, toChangeVolume, toPause, toStop } = usePlayerAction();

  function recoverPlay(recordVolume?: number) {
    if (!isMobile) {
      toChangeVolume(recordVolume || 1);
    }
    if (isMobile && document.hidden) return;
    toPlay();
  }

  function forcePausePlay() {
    // 无延迟暂停也会拉流，所以需要暂停拉流而不是暂停
    if (playerStore.isLowLatency) {
      toStop();
    } else {
      toPause();
    }
  }

  return {
    recoverPlay,
    forcePausePlay,
  };
};

/**
 * 处理连麦后暂停播放器逻辑
 * @hook
 */
export const useConnectMicing = () => {
  const connectMicStore = useConnectMicStore();
  const playerStore = usePlayerStore();

  const { recoverPlay, forcePausePlay } = useConnectMicingPlayerHelper();

  let recordVolume: number | undefined;

  function onConnectMicingChange(isConnectMicing: boolean) {
    // 断开连麦恢复播放器状态
    if (!isConnectMicing) {
      return recoverPlay(recordVolume);
    }

    if (!isMobile) {
      recordVolume = playerStore.currentVolume;
    }

    forcePausePlay();
  }

  /**
   * 移动端普通延迟情况下连麦，播放器可能会在断流小窗或者浏览器的原因恢复播放，所以连麦过程中遇到播放则主动暂停
   */
  function onPlayStatusChange(playStatus: PlayStatus) {
    if (
      !connectMicStore.isConnectMicing ||
      playerStore.isLowLatency ||
      playStatus === PlayStatus.Pause
    ) {
      return;
    }

    nextTick(() => {
      if (connectMicStore.isConnectMicing) {
        forcePausePlay();
      }
    });
  }

  watch(() => connectMicStore.isConnectMicing, onConnectMicingChange);
  if (isMobile) {
    watch(() => playerStore.playStatus, onPlayStatusChange);
  }
};
