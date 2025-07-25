/**
 * @file 播放器 hook
 */
import { onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getImgSize } from '@/assets/utils/image';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  LiveStatus,
  PlayStatus,
  SetupPlayerOptions,
  SetupPlayerPlaybackOptions,
} from '@polyv/live-watch-sdk';
import { usePlayerEvent } from './use-player-event';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { getForceAutoResult } from '@/assets/utils/video/force-autoplay';
import { useGlobalInject } from '@/app/use-global-inject';
import { debounce } from 'lodash-es';

export type InitPlayerOptions = Omit<SetupPlayerOptions, 'container'>;

export type InitPlayerOptionsType = InitPlayerOptions | (() => InitPlayerOptions);

export const usePlayerMain = ({
  initPlayerOptions = {},
}: {
  initPlayerOptions?: InitPlayerOptionsType;
} = {}) => {
  const { getWatchCore, getEmitter } = useGlobalInject();

  const { bindPlayerEvents, unbindPlayerEvents } = usePlayerEvent();

  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const { currentPlaybackTarget } = storeDefinitionToRefs(usePlaybackStore);
  const langStore = useLangStore();
  const layoutStore = useLayoutStore();
  const forceAutoPlayRs = getForceAutoResult();

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

  /** 已经强制切换回放过了 */
  let __hadForceChangePlayback = false;

  /**
   * 获取播放器的回放参数
   * @warn 副作用：修改回放视频尺寸，非回放状态清空 currentPlaybackTarget
   */
  async function getPlayerPlaybackOptions(): Promise<SetupPlayerPlaybackOptions | undefined> {
    if (channelStore.liveStatus !== LiveStatus.Playback) {
      playbackStore.updateCurrentPlaybackTarget(undefined);
      return;
    }

    if (!currentPlaybackTarget.value) {
      if (__hadForceChangePlayback) {
        console.error('已尝试过强制切回放，切换失败，请检查后台是否开启观看页回放功能');
        return;
      }

      // 进行强制切换回放处理
      const watchCore = getWatchCore();
      if (watchCore.channel.getForceChangePlaybackEnabled()) {
        playbackStore.syncPlaybackStore();
        await playbackStore.initCurrentPlaybackTarget();
        // 聊天重放需要重新渲染聊天列表
        if (playbackStore.chatMsgReplayEnabled) {
          getEmitter().emit(appEvents.chat.ResetUpChatMsgList);
        }
        __hadForceChangePlayback = true;
        return getPlayerPlaybackOptions();
      }

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

    __hadForceChangePlayback = false; // 重置状态
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
  const initPlayer: () => void = debounce(async () => {
    const container = unref(playerContainer);
    if (!container) {
      return;
    }

    if (!playerStore.playerEnabled) return;

    playerStore.$patch({
      playerInited: false,
      isPlayStarted: false,
      playerControlVisible: false,
      sdkPlayerUIControlVisible: false,
    });
    playbackStore.$patch({
      isPlaybacking: false,
    });

    let playerOptions: SetupPlayerOptions = {
      container,
      lowLatency: playerStore.isLowLatency,
      language: langStore.currentLang.toString(),
      streamTrackKey: playerStore.streamTrackKey,
      languageStreamEnabled: true,
      autoChangePlayback: false, // @PLV-WARN 默认不要更改该选项配置，如果业务上需要直播结束后自动切换回放，请先咨询保利威工作人员
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
    const playbackOptions = await getPlayerPlaybackOptions();
    if (playbackOptions) {
      playerOptions.playbackOptions = playbackOptions;
    } else {
      await getPushStreamInfo();
    }

    if (forceAutoPlayRs) {
      playerOptions.extraPlayerOptions = Object.assign(playerOptions.extraPlayerOptions || {}, {
        customVideoElement: forceAutoPlayRs.media,
      });
    }

    const watchCore = getWatchCore();
    await watchCore.player.setupPlayer(playerOptions);

    bindPlayerEvents();

    if (watchCore.player.supportPlaybackVideo().support) {
      playbackStore.$patch({
        isPlaybacking: true,
      });
    }
  }, 300);

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

  watch(
    () => layoutStore.mobilePlayerIsPageFullscreen,
    () => {
      const watchCore = getWatchCore();
      watchCore.player.resizeBarrage();
    },
  );

  watch(
    () => playerStore.playStatus,
    () => {
      if (playerStore.playStatus === PlayStatus.Playing) {
        playerStore.$patch({
          onceHiddenPlayButton: false,
        });
      }
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
