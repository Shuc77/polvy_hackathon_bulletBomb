import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { PlaybackMode, PlaybackTarget, PlayerEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount } from 'vue';

/**
 * 播放器相关事件 hook
 */
export const usePlayerEvent = () => {
  const playerStore = usePlayerStore();
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();

  function onPlayerInited(): void {
    playerStore.$patch({
      playerInited: true,
    });
  }

  function onPlayerPlaying(): void {
    playerStore.$patch({
      isPlayStarted: true,
    });
  }

  function onHistoryPlay(evt: { historyTime: number }): void {
    eventBus.$emit(appEvents.player.ShowHistoryTips, evt.historyTime);
  }

  /** 处理回放播放结束 */
  async function onPlaybackOver() {
    const watchCore = getWatchCore();
    const channelDetail = channelStore.channelDetail;

    const toPlayTarget = async (target: PlaybackTarget) => {
      playbackStore.$patch({
        currentPlaybackTarget: target,
      });
      await watchCore.player.changePlayback(target.playbackOptions);
      watchCore.player.play();
    };

    // 单个回放
    if (
      channelDetail?.playbackInfo?.type === PlaybackMode.Single &&
      playbackStore.currentPlaybackTarget
    ) {
      await toPlayTarget(playbackStore.currentPlaybackTarget);
      return;
    }

    if (playbackStore.playbackList.length === 0) {
      return;
    }

    let playbackTarget: PlaybackTarget | undefined;
    const playbackLength = playbackStore.playbackList.length;
    const currentIndex = playbackStore.playbackList.findIndex(target => {
      return target.playbackId === playbackStore.currentPlaybackTarget?.playbackId;
    });

    if (currentIndex === playbackLength - 1) {
      // 当前播放的是列表的最后一个
      if (playbackStore.isNoMore) {
        // 已经拿完了回放列表，则播放第一个
        playbackTarget = playbackStore.playbackList[0];
      } else {
        // 加载下一页
        await playbackStore.loadNextPlaybackList();
        const nextTarget = playbackStore.playbackList[currentIndex + 1];
        playbackTarget = nextTarget;
      }
    } else {
      // 下一个是在本页
      const nextTarget = playbackStore.playbackList[currentIndex + 1];
      playbackTarget = nextTarget;
    }

    if (playbackTarget) {
      await toPlayTarget(playbackTarget);
    }
  }

  /** 音量修改 */
  function onVolumeChanged() {
    const watchCore = getWatchCore();
    const currentVolume = watchCore.player.getCurrentVolume();
    playerStore.$patch({ currentVolume });
  }

  /** 绑定播放器事件 */
  function bindPlayerEvents() {
    unbindPlayerEvents();
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.on(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.on(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.on(PlayerEvents.VolumeChanged, onVolumeChanged);
  }

  /** 解绑播放器事件 */
  function unbindPlayerEvents() {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.off(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.off(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.off(PlayerEvents.VolumeChanged, onVolumeChanged);
  }

  onBeforeUnmount(() => {
    unbindPlayerEvents();
  });

  return {
    bindPlayerEvents,
    unbindPlayerEvents,
  };
};
