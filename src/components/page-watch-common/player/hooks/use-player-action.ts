/**
 * @file 播放器操作 hook
 */
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore } from '@/store/use-player-store';
import { PlayStatus } from '@polyv/live-watch-sdk';
import debounce from 'lodash-es/debounce';

/**
 * 播放器操作 hook
 */
export const usePlayerAction = () => {
  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();

  /**
   * 是否不允许处理
   */
  function isNotAllowAction(): boolean {
    return !playerStore.isPlayMode;
  }

  /** 播放 */
  function toPlay(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.play();
  }

  /** 暂停 */
  function toPause(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.pause();
  }

  /** 如果当前是暂停则调用播放 */
  function toTryPlay() {
    if (playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
    }
  }

  /** 切换播放状态 */
  function toTogglePlay(): void {
    if (playerStore.playStatus === PlayStatus.Pause) {
      toPlay();
    } else {
      toPause();
    }
  }

  /** 刷新 */
  function toRefresh(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.refresh();
  }

  /** 防抖设置音量 */
  const setVolumeDebounce = debounce((volume: number) => {
    getWatchCore().player.setVolume(volume);
  }, 300);

  /** 设置音量 */
  function toChangeVolume(volume = 1): void {
    if (volume < 0) {
      volume = 0;
    }
    if (volume > 1) {
      volume = 1;
    }
    playerStore.$patch({
      currentVolume: volume,
    });
    setVolumeDebounce(volume);
  }

  /** 切换显示/隐藏弹幕移动端设置弹窗 */
  function toToggleBarrageMobileSettingVisible(toShow: boolean) {
    playerStore.$patch({
      barrageMobileSettingVisible: toShow,
    });
  }

  /**
   * 递增音量
   * @param diff 增加的音量，默认：0.05
   */
  function toIncreaseVolume(diff = 0.05) {
    const currentVolume = playerStore.currentVolume + diff;
    toChangeVolume(currentVolume);
  }

  /**
   * 递减音量
   * @param diff 减少的音量，默认：0.05
   */
  function toReductionVolume(diff = 0.05) {
    const currentVolume = playerStore.currentVolume - diff;
    toChangeVolume(currentVolume);
  }

  /** 切换弹幕显示 */
  function toToggleBarrageShow(): void {
    playerStore.$patch({
      barrageShow: !playerStore.barrageShow,
    });
    getWatchCore().player.setBarrageShow(playerStore.barrageShow);
  }

  /** 切换弹幕速度 */
  function toChangeBarrageSpeed(speed: number) {
    playerStore.$patch({
      barrageSpeed: speed,
    });
    getWatchCore().player.setBarrageSpeed(speed);
  }

  /** 切换线路 */
  function toChangeLine(line: number): void {
    getWatchCore().player.changeLine(line);
    toTryPlay();
  }

  /** 切换清晰度级别 */
  function toChangeQualityLevel(level: number): void {
    getWatchCore().player.changeQualityLevel(level);
    toTryPlay();
  }

  /** 切换倍速 */
  function toChangeRate(rate: number): void {
    getWatchCore().player.changeRate(rate);
    toTryPlay();
  }

  /** 返回直播 */
  function toReturnLive() {
    toSeekVideo(-1);
  }

  /** 设置播放进度 */
  function toSeekVideo(time: number): void {
    if (time > playerStore.durationTime) {
      time = playerStore.durationTime;
    }
    getWatchCore().player.seekVideo(time);
  }

  /**
   * 视频前进
   * @param second 秒数，默认：15
   */
  function toForwardVideo(second = 15) {
    const currentTime = playerStore.currentTime + second;
    toSeekVideo(currentTime);
    playerStore.$patch({
      currentTime,
    });
  }

  /**
   * 视频后退
   * @param second 秒数，默认：15
   */
  function toBackOffVideo(second = 15) {
    const currentTime = playerStore.currentTime - second;
    toSeekVideo(currentTime);
    playerStore.$patch({
      currentTime,
    });
  }

  /** 重新播放 */
  function toRestart(): void {
    toSeekVideo(0);
    toPlay();
  }

  /** 切换移动端播放器页面全屏 */
  function toToggleMobilePageFullscreen() {
    layoutStore.$patch({
      mobilePlayerIsPageFullscreen: !layoutStore.mobilePlayerIsPageFullscreen,
    });
  }

  /** 切换无延迟播放 */
  function toSetLowLowLatency(isLowLatency = true) {
    playerStore.$patch({
      isLowLatency,
    });
    layoutStore.$patch({
      mobilePlayerIsPageFullscreen: false,
    });
    setTimeout(() => {
      eventBus.$emit(appEvents.player.ResetUpPlayer);
    }, 0);
  }

  return {
    toPlay,
    toPause,
    toTogglePlay,
    toRefresh,
    toChangeVolume,
    toToggleBarrageMobileSettingVisible,
    toIncreaseVolume,
    toReductionVolume,
    toToggleBarrageShow,
    toChangeBarrageSpeed,
    toChangeLine,
    toChangeQualityLevel,
    toChangeRate,
    toReturnLive,
    toSeekVideo,
    toForwardVideo,
    toBackOffVideo,
    toRestart,
    toToggleMobilePageFullscreen,
    toSetLowLowLatency,
  };
};
