/**
 * @file 试看播放器 hook
 */
import { onBeforeUnmount, onMounted, ref, unref } from 'vue';
import { ChannelTrialInfo, SetupPlayerOptions } from '@polyv/live-watch-sdk';

import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerStore } from '@/store/use-player-store';

import { usePlayerTrialEvent } from './use-player-trial-event';

export type InitPlayerOptions = Omit<SetupPlayerOptions, 'container'>;

/** @hook 试看播放器 Hook */
export const usePlayerTrialMain = (
  hookOptions: {
    initPlayerOptions?: InitPlayerOptions;
    trialInfo?: ChannelTrialInfo | null;
  } = {},
) => {
  const { initPlayerOptions = {}, trialInfo = null } = hookOptions;

  const { bindPlayerEvents, unbindPlayerEvents } = usePlayerTrialEvent({ trialInfo });

  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();

  /** 播放器渲染容器 */
  const playerContainer = ref<HTMLDivElement>();

  /** 初始化播放器 */
  async function initPlayer(): Promise<void> {
    const container = unref(playerContainer);
    if (!container || !trialInfo) {
      return;
    }

    playerStore.$patch({
      playerInited: false,
      isPlayStarted: false,
    });

    const playerOptions: SetupPlayerOptions = {
      container,
      barrageEnabled: true,
      marqueeName: trialInfo.viewerInfo.marqueeName || undefined,
      vrHead: channelStore.channelDetail?.domain.assetsUrlPrefix,
      x5FullPage: true,
      sessionId: trialInfo.channelSessionId,
      ...initPlayerOptions,
    };
    const watchCore = getWatchCore();
    await watchCore.player.setupPlayer(playerOptions);

    bindPlayerEvents();
  }

  /** 销毁播放器 */
  function destroyPlayer(): void {
    const watchCore = getWatchCore();
    watchCore.player.destroyPlayer();

    unbindPlayerEvents();
  }

  onMounted(() => {
    initPlayer();
  });

  onBeforeUnmount(() => {
    destroyPlayer();
  });

  return {
    playerContainer,
  };
};
