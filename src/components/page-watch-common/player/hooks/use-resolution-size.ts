import { useGlobalInject } from '@/app/use-global-inject';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, Ref, unref } from 'vue';

/** 获取视频宽度 */
function getVideoWidth(videoElement: HTMLVideoElement) {
  if (typeof videoElement.videoWidth !== 'undefined') {
    return videoElement.videoWidth;
  } else {
    return videoElement.offsetWidth;
  }
}

/** 获取视频高度 */
function getVideoHeight(videoElement: HTMLVideoElement) {
  if (typeof videoElement.videoWidth !== 'undefined') {
    return videoElement.videoHeight;
  } else {
    return videoElement.offsetHeight;
  }
}

/**
 * 播放流尺寸 hook
 */
export const useResolutionSize = (options: {
  playerContainer: Ref<HTMLDivElement | undefined>;
}) => {
  const { getWatchCore } = useGlobalInject();

  const { playerContainer } = options;
  const playerStore = usePlayerStore();

  /** 获取 video 节点 */
  function getVideoElement(): HTMLVideoElement | null {
    const containerElem = unref(playerContainer);
    if (!containerElem) {
      return null;
    }

    return containerElem.querySelector('video');
  }

  /** 重试定时器 */
  let retryTimer: number | undefined;
  /** 重试次数 */
  let retryCount = 0;

  /** 设置重试定时器 */
  function startRetryTimer() {
    removeRetryTimer();
    retryTimer = window.setTimeout(() => {
      refreshResolution();
    }, 100);
  }

  /** 移除重试定时器 */
  function removeRetryTimer() {
    retryCount = 0;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
  }

  /**
   * 刷新 video 标签的 videoWidth、videoHeight，改变视频流尺寸
   */
  function refreshResolutionByVideoSize(videoElem: HTMLVideoElement) {
    const videoWidth = getVideoWidth(videoElem);
    const videoHeight = getVideoHeight(videoElem);

    const notNeedRefresh =
      videoWidth === playerStore.resolutionWidth && videoHeight === playerStore.resolutionHeight;
    if (notNeedRefresh) {
      removeRetryTimer();
      return;
    }

    if (videoWidth > 0 && videoHeight > 0) {
      removeRetryTimer();
      playerStore.$patch({
        resolutionWidth: videoWidth,
        resolutionHeight: videoHeight,
      });
    } else {
      // 部分流还是需要通过重试轮询来获取尺寸，设置轮询最大次数为 100 次
      if (retryCount >= 100) {
        removeRetryTimer();
        console.error('无法正常获取视频流的尺寸');
        return;
      }
      retryCount += 1;
      startRetryTimer();
    }
  }

  function refreshResolution() {
    const videoElem = getVideoElement();
    if (!videoElem) {
      return;
    }

    const isVideoDataLoaded = videoElem.readyState >= 1;
    if (isVideoDataLoaded) {
      refreshResolutionByVideoSize(videoElem);
    } else {
      videoElem.addEventListener('loadeddata', () => {
        refreshResolutionByVideoSize(videoElem);
      });
    }
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.on(PlayerEvents.PlayerPlaying, refreshResolution);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.off(PlayerEvents.PlayerPlaying, refreshResolution);

    removeRetryTimer();
  });
};
