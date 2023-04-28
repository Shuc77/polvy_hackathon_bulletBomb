import { appEvents, eventBus } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerStore } from '@/store/use-player-store';
import { MarqueeData, PlayerEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export function bindPlayerModuleEvents(): void {
  const watchCore = getWatchCore();
  const playerStore = usePlayerStore();
  const channelStore = useChannelStore();

  watchCore.player.eventEmitter.on(PlayerEvents.PlayerStoreInfoChanged, () => {
    playerStore.syncPlayerInfo();
  });

  /** 无延迟错误，自动切回 CDN 播放器 */
  watchCore.player.eventEmitter.on(PlayerEvents.LowLatencyError, (evt: { errorCode: string }) => {
    toast.error(`${evt.errorCode} ${translate('player.latency.error')}`);

    playerStore.$patch({
      isLowLatency: false,
    });
    eventBus.$emit(appEvents.player.ResetUpPlayer);
  });

  /** 设置跑马灯数据 */
  watchCore.player.eventEmitter.on(
    PlayerEvents.MarqueeDataUpdate,
    (evt: { marqueeData: MarqueeData }) => {
      channelStore.$patch({
        marqueeData: evt.marqueeData,
      });
    },
  );
}
