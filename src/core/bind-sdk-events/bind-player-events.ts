import { appEvents, eventBus } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { toast } from '@/hooks/components/use-toast';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { usePlaybackStore } from '@/store/use-playback-store';

export function bindPlayerModuleEvents(): void {
  const watchCore = getWatchCore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerInfoChange, () => {
    playerStore.syncPlayerInfo();
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerWarmUpSettingChange, () => {
    playerStore.syncWarmUpSetting();
  });

  /** 无延迟错误，自动切回 CDN 播放器 */
  watchCore.player.eventEmitter.on(PlayerEvents.LowLatencyError, evt => {
    toast.error(`${evt.errorCode || ''} ${translate('player.latency.error')}`);

    playerStore.$patch({
      isLowLatency: false,
    });
    eventBus.$emit(appEvents.player.ResetUpPlayer);
  });

  watchCore.player.eventEmitter.on(PlayerEvents.TimeUpdate, params => {
    if (playbackStore.chatReplayEnabled) {
      watchCore.chat.processChatMsgReplay(params);
    }
  });

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerMarqueeError, () => {
    toast.error(translate('player.marquee.checkError'));
  });
}
