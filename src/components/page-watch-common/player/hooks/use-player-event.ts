import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlaybackList } from '@/components/page-watch-common/playback-list/use-playback-list';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  PlaybackMode,
  PlaybackTarget,
  PlayerEvents,
  PlayerEventsRelations,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount } from 'vue';
import { usePlayerAction } from './use-player-action';

/**
 * 播放器相关事件 hook
 */
export const usePlayerEvent = () => {
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();
  const { toToggleBarrageMobileSettingVisible } = usePlayerAction();

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
    const { onClickPlaybackItem } = usePlaybackList();

    const toPlayTarget = async (target: PlaybackTarget) => {
      await onClickPlaybackItem(target);
    };

    // 单个回放
    if (
      playbackStore.playbackMode === PlaybackMode.Single &&
      playbackStore.currentPlaybackTarget &&
      !playbackStore.chatReplayEnabled // 单个回放结束后，如果处于聊天重放，就不再重复播放了
    ) {
      await toPlayTarget(playbackStore.currentPlaybackTarget);
      return;
    }

    // 回放列表为空
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

    // 获取新的播放目标来播放
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

  /** 调起弹幕设置弹窗 */
  function onBarrageSettingClick() {
    toToggleBarrageMobileSettingVisible(true);
  }

  /** 全屏 */
  function onToggleFullScreen(data: PlayerEventsRelations[PlayerEvents.ToggleFullScreen]) {
    layoutStore.$patch({
      mobileNormalLatencyPlayerIsFullscreen: data.isPlayerFullscreen,
    });
  }

  /** 绑定播放器事件 */
  function bindPlayerEvents() {
    unbindPlayerEvents();
    const watchCore = getWatchCore();

    watchCore.player.eventEmitter.on(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.on(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.on(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.on(PlayerEvents.VolumeChange, onVolumeChanged);
    watchCore.player.eventEmitter.on(PlayerEvents.BarrageSettingClick, onBarrageSettingClick);
    watchCore.player.eventEmitter.on(PlayerEvents.ToggleFullScreen, onToggleFullScreen);
  }

  /** 解绑播放器事件 */
  function unbindPlayerEvents() {
    const watchCore = getWatchCore();

    watchCore.player.eventEmitter.off(PlayerEvents.PlayerInited, onPlayerInited);
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerPlaying, onPlayerPlaying);
    watchCore.player.eventEmitter.off(PlayerEvents.HistoryPlay, onHistoryPlay);
    watchCore.player.eventEmitter.off(PlayerEvents.PlaybackOver, onPlaybackOver);
    watchCore.player.eventEmitter.off(PlayerEvents.VolumeChange, onVolumeChanged);
    watchCore.player.eventEmitter.off(PlayerEvents.BarrageSettingClick, onBarrageSettingClick);
    watchCore.player.eventEmitter.off(PlayerEvents.ToggleFullScreen, onToggleFullScreen);
  }

  onBeforeUnmount(() => {
    unbindPlayerEvents();
  });

  return {
    bindPlayerEvents,
    unbindPlayerEvents,
  };
};
