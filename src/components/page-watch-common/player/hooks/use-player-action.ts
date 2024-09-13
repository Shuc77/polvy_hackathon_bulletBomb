/**
 * @file 播放器操作 hook
 */
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlayerStore, SwitchTipsStatus } from '@/store/use-player-store';
import { PlayStatus, PlayerEvents } from '@polyv/live-watch-sdk';
import debounce from 'lodash-es/debounce';
import { usePlayerControl } from './use-player-control';

/**
 * 播放器操作 hook
 */
export const usePlayerAction = () => {
  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();
  const connectMicStore = useConnectMicStore();

  const { playButtonVisible, bigPlayButtonVisible } = usePlayerControl();

  /**
   * 是否不允许处理
   */
  function isNotAllowAction(): boolean {
    return !playerStore.isPlayMode || !playerStore.playerInited;
  }

  /** 播放 */
  function toPlay(): void {
    if (isNotAllowAction()) {
      return;
    }

    // 避免连麦中播放播放器导致重音
    if (connectMicStore.isConnectMicing) {
      console.warn('isConnectMicing, player can not to play');
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

  /** 停止拉流 */
  function toStop(): void {
    if (isNotAllowAction()) {
      return;
    }

    getWatchCore().player.stop();
  }

  function forcePausePlay(
    opts: { onceHiddenPlayButton: boolean } = { onceHiddenPlayButton: false },
  ) {
    playerStore.$patch({ onceHiddenPlayButton: opts.onceHiddenPlayButton });

    // 无延迟暂停也会拉流，所以需要暂停拉流而不是暂停
    if (playerStore.isLowLatency) {
      toStop();
      toPause();
    } else {
      toPause();
    }
  }

  /** 冻结视频的播放 */
  function toFreezePlay(isFreeze: boolean) {
    getWatchCore().player.freezePlay(isFreeze);
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

  /**
   * 不显示大播放按钮，并且不显示左下角播放暂停按钮，部分操作失效:
   * 1.点击播放器区域
   * 2.键盘空格按键
   * 3.竖屏双击屏幕
   * */
  function toTogglePlayInLimit(): void {
    const { playButtonVisible, bigPlayButtonVisible } = usePlayerControl();
    if (!bigPlayButtonVisible.value && !playButtonVisible.value) {
      return;
    }

    toTogglePlay();
  }

  /**
   * 不显示大播放按钮，并且不显示左下角播放暂停按钮，播放操作失效
   * */
  function toPlayInLimit(): void {
    if (!bigPlayButtonVisible.value && !playButtonVisible.value) {
      return;
    }

    toPlay();
  }

  /**
   * 不显示大播放按钮，并且不显示左下角播放暂停按钮，暂停操作失效
   * */
  function toPauseInLimit(): void {
    if (!bigPlayButtonVisible.value && !playButtonVisible.value) {
      return;
    }

    toPause();
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

  /** 切换弹幕字号 */
  function toChangeBarrageSize(size: number) {
    playerStore.$patch({
      barrageSize: size,
    });
    getWatchCore().player.setBarrageSize(size);
  }

  /** 切换弹幕透明度 */
  function toChangeBarrageAlpha(alpha: number) {
    playerStore.$patch({
      barrageAlpha: alpha,
    });
    getWatchCore().player.setBarrageAlpha(alpha);
  }

  /** 切换弹幕位置 */
  function toChangeBarrageLocation(index: number) {
    playerStore.$patch({
      currentBarrageLocationIndex: index,
    });
    getWatchCore().player.setBarrageLocation(index);
  }

  let lineSwitchingTimer: NodeJS.Timeout;
  let lineFinishTimer: NodeJS.Timeout;

  function handleLineChange() {
    clearTimeout(lineSwitchingTimer);
    playerStore.switchLineTipStatus = SwitchTipsStatus.Finish;

    lineFinishTimer = setTimeout(() => {
      if (playerStore.switchLineTipStatus === SwitchTipsStatus.Finish) {
        playerStore.switchLineTipStatus = SwitchTipsStatus.Hide;
      }
    }, 3000);
  }

  function listenLineChangeToShowTips(line: number) {
    const playerModule = getWatchCore().player;

    clearTimeout(lineSwitchingTimer);
    clearTimeout(lineFinishTimer);
    playerStore.switchLineTipStatus = SwitchTipsStatus.Switching;
    playerStore.switchLineLevel = line;
    playerModule.eventEmitter.off(PlayerEvents.LineChange, handleLineChange);
    playerModule.eventEmitter.once(PlayerEvents.LineChange, handleLineChange);

    lineSwitchingTimer = setTimeout(() => {
      if (playerStore.switchLineTipStatus === SwitchTipsStatus.Switching) {
        playerStore.switchLineTipStatus = SwitchTipsStatus.Hide;
      }
    }, 3000);
  }

  /** 切换线路 */
  function toChangeLine(line: number): void {
    listenLineChangeToShowTips(line);
    getWatchCore().player.changeLine(line);
    toTryPlay();
  }

  let levelSwitchingTimer: NodeJS.Timeout;
  let levelFinishTimer: NodeJS.Timeout;

  function handleQualityLevelChange() {
    clearTimeout(levelSwitchingTimer);
    playerStore.switchQualityTipStatus = SwitchTipsStatus.Finish;
    playerStore.switchQualityLevel = getWatchCore().player.getCurrentQualityLevel();

    levelFinishTimer = setTimeout(() => {
      if (playerStore.switchQualityTipStatus === SwitchTipsStatus.Finish) {
        playerStore.switchQualityTipStatus = SwitchTipsStatus.Hide;
      }
    }, 3000);
  }

  function listenLevelChangeToShowTips(level: number) {
    const playerModule = getWatchCore().player;

    clearTimeout(levelSwitchingTimer);
    clearTimeout(levelFinishTimer);
    playerStore.switchQualityTipStatus = SwitchTipsStatus.Switching;
    playerStore.switchQualityLevel = level;
    playerModule.eventEmitter.off(PlayerEvents.QualityLevelChange, handleQualityLevelChange);
    playerModule.eventEmitter.once(PlayerEvents.QualityLevelChange, handleQualityLevelChange);

    levelSwitchingTimer = setTimeout(() => {
      if (playerStore.switchQualityTipStatus === SwitchTipsStatus.Switching) {
        playerStore.switchQualityTipStatus = SwitchTipsStatus.Hide;
      }
    }, 3000);
  }

  function toChangeQualityLevel(level: number) {
    listenLevelChangeToShowTips(level);

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
   * 不显示进度条，键盘左右按键seek对应失效
   */
  function toForwardVideoInLimit() {
    const { playerProgressVisible } = usePlayerControl();
    if (!playerProgressVisible.value) return;

    toForwardVideo();
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

  /**
   * 不显示进度条，键盘左右按键seek对应失效
   */
  function toBackOffVideoInLimit() {
    const { playerProgressVisible } = usePlayerControl();
    if (!playerProgressVisible.value) return;

    toBackOffVideo();
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
      isAudioPlayerMode: false,
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
    toStop,
    forcePausePlay,
    toTogglePlay,
    toRefresh,
    toChangeVolume,
    toToggleBarrageMobileSettingVisible,
    toIncreaseVolume,
    toReductionVolume,
    toToggleBarrageShow,
    toChangeBarrageSpeed,
    toChangeBarrageSize,
    toChangeBarrageAlpha,
    toChangeBarrageLocation,
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
    toTogglePlayInLimit,
    toPlayInLimit,
    toPauseInLimit,
    toForwardVideoInLimit,
    toBackOffVideoInLimit,
    toFreezePlay,
    listenLevelChangeToShowTips,
  };
};
