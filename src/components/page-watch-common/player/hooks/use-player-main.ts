/**
 * @file 播放器 hook
 */
import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getImgSize } from '@/assets/utils/image';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useLangStore } from '@/store/use-lang-store';
import { LiveStatus, SetupPlayerOptions } from '@polyv/live-watch-sdk';
import { usePlayerEvent } from './use-player-event';
import { LangType } from '@/assets/lang/lang-enum';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

export type InitPlayerOptions = Omit<SetupPlayerOptions, 'container'>;

export type InitPlayerOptionsType = InitPlayerOptions | (() => InitPlayerOptions);

export const usePlayerMain = ({
  initPlayerOptions = {},
}: {
  initPlayerOptions?: InitPlayerOptionsType;
} = {}) => {
  const { bindPlayerEvents, unbindPlayerEvents } = usePlayerEvent();

  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const { currentPlaybackTarget } = storeDefinitionToRefs(usePlaybackStore);
  const langStore = useLangStore();

  /** 播放器渲染容器 */
  const playerContainer = ref<HTMLDivElement>();

  /**
   * 根据图片地址设置流尺寸
   * @param imageUrl 图片地址
   */
  async function setResolutionSizeByImage(imageUrl: string) {
    try {
      const { width, height } = await getImgSize(imageUrl);
      if (width && height) {
        playerStore.$patch({
          resolutionWidth: width,
          resolutionHeight: height,
        });
      }
    } catch (e) {}
  }

  /**
   * 获取播放器的回放参数
   * @warn 副作用：修改回放视频尺寸，非回放状态清空 currentPlaybackTarget
   */
  async function getPlayerPaybackOptions() {
    if (channelStore.liveStatus !== LiveStatus.Playback) {
      playbackStore.$patch({
        currentPlaybackTarget: undefined,
      });
      return;
    }

    if (!currentPlaybackTarget.value) {
      console.error('处于回放状态，但不存在回放对象');
      return;
    }

    // 先处理回放的视频尺寸
    if (currentPlaybackTarget.value.width && currentPlaybackTarget.value.height) {
      playerStore.$patch({
        resolutionWidth: currentPlaybackTarget.value.width,
        resolutionHeight: currentPlaybackTarget.value.height,
      });
    } else if (currentPlaybackTarget.value.firstImage) {
      // 通过首帧图来设置流的尺寸
      await setResolutionSizeByImage(currentPlaybackTarget.value.firstImage);
    }

    return currentPlaybackTarget.value.playbackOptions;
  }

  /**
   * 获取推流信息
   */
  async function getPushStreamInfo() {
    if (channelStore.liveStatus !== LiveStatus.Live) {
      return;
    }

    try {
      const watchCore = getWatchCore();
      const pushInfo = await watchCore.channel.getPushInfo();
      if (pushInfo.resolutionWidth && pushInfo.resolutionHeight) {
        playerStore.$patch({
          resolutionWidth: pushInfo.resolutionWidth,
          resolutionHeight: pushInfo.resolutionHeight,
        });
      }

      channelStore.$patch({
        currentStreamType: pushInfo.streamType,
      });
    } catch (error) {
      console.error('getPushStreamInfo', error);
    }
  }

  /** 初始化播放器 */
  async function initPlayer(): Promise<void> {
    const container = unref(playerContainer);
    if (!container) {
      return;
    }

    if (!playerStore.playerEnabled) return;

    const watchCore = getWatchCore();

    playerStore.$patch({
      playerInited: false,
      isPlayStarted: false,
    });
    playbackStore.$patch({
      isPlaybacking: false,
    });

    let playerOptions: SetupPlayerOptions = {
      container,
      lowLatency: playerStore.isLowLatency,
      language: langStore.currentLang === LangType.Chinese ? 0 : 1,
    };

    // 其他参数
    if (typeof initPlayerOptions === 'function') {
      playerOptions = {
        ...playerOptions,
        ...initPlayerOptions(),
      };
    } else {
      playerOptions = {
        ...playerOptions,
        ...initPlayerOptions,
      };
    }

    // 获取回放参数
    const playbackOptions = await getPlayerPaybackOptions();
    if (playbackOptions) {
      playerOptions.playbackOptions = playbackOptions;
    } else {
      await getPushStreamInfo();
    }

    await watchCore.player.setupPlayer(playerOptions);

    bindPlayerEvents();

    if (playerOptions.playbackOptions) {
      playbackStore.$patch({
        isPlaybacking: true,
      });
    }
  }

  /** 销毁播放器 */
  function destroyPlayer(): void {
    const watchCore = getWatchCore();
    watchCore.player.destroyPlayer();
    unbindPlayerEvents();
  }

  watch(
    () => channelStore.liveStatus,
    () => {
      const watchCore = getWatchCore();
      const supportLowLatency = watchCore.player.supportLowLatency().support;
      playerStore.$patch({
        supportLowLatency,
      });
      if (channelStore.liveStatus === LiveStatus.Live && supportLowLatency) {
        playerStore.$patch({
          isLowLatency: true,
        });
      }

      initPlayer();
    },
  );

  useEventBusListener(appEvents.player.ResetUpPlayer, () => {
    initPlayer();
  });

  onMounted(() => {
    const watchCore = getWatchCore();
    const supportLowLatency = watchCore.player.supportLowLatency().support;
    playerStore.$patch({
      supportLowLatency,
      isLowLatency: supportLowLatency,
    });

    initPlayer();
  });

  onBeforeUnmount(() => {
    destroyPlayer();
  });

  return {
    playerContainer,
  };
};
