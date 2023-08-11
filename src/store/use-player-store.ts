/**
 * @file 播放器 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import {
  BarrageSetting,
  LiveStatus,
  PlayerLogoSetting,
  PlayerWarmUpSetting,
  PlayStatus,
  QualityLevelItem,
  WarmUpType,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useLayoutStore } from './use-layout-store';
import { usePlaybackStore } from './use-playback-store';

export interface PlayerStoreState {
  /** 配置是否使用播放器 */
  playerEnabled: Ref<boolean>;
  /** 是否处于可播放的模式 */
  isPlayMode: ComputedRef<boolean>;
  /** 播放器是否已初始化 */
  playerInited: Ref<boolean>;
  /** 是否已开始播放 */
  isPlayStarted: Ref<boolean>;
  /** 当前播放状态 */
  playStatus: Ref<PlayStatus>;
  /** 播放器暖场设置 */
  warmUpSetting: Ref<PlayerWarmUpSetting>;
  /** 是否显示播放器暖场图片 */
  showWarmUpImg: ComputedRef<boolean>;
  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  showAudioLivePlaceholder: ComputedRef<boolean>;
  /** 播放器 logo 设置 */
  logoSetting: Ref<PlayerLogoSetting>;
  /** 弹幕设置 */
  barrageSetting: Ref<BarrageSetting>;
  /** 弹幕显示状态 */
  barrageShow: Ref<boolean>;
  /** 是否支持弹幕速度切换 */
  supportBarrageSpeed: Ref<boolean>;
  /** 弹幕速度 340 | 270 | 200 | 130 | 60 */
  barrageSpeed: Ref<number>;
  /** 弹幕移动端设置是否显示 */
  barrageMobileSettingVisible: Ref<boolean>;
  /** 观看延迟时间，单位：毫秒 */
  delayTime: Ref<number>;
  /** 是否支持无延迟观看 */
  supportLowLatency: Ref<boolean>;
  /** 是否无延迟观看 */
  isLowLatency: Ref<boolean>;
  /** 是否支持刷新 api */
  supportRefresh: Ref<boolean>;
  /** 是否支持自动播放 */
  supportAutoPlay: Ref<boolean>;
  /** 当前音量 */
  currentVolume: Ref<number>;
  /** 总线路数 */
  lineCount: Ref<number>;
  /** 当前线路索引 */
  currentLine: Ref<number>;
  /** 可选的清晰度列表 */
  qualityLevels: Ref<QualityLevelItem[]>;
  /** 当前清晰度级别 */
  currentQualityLevel: Ref<number>;
  /** 可选的倍速列表 */
  rateList: Ref<number[]>;
  /** 当前倍速 */
  currentRate: Ref<number>;
  /** 当前播放时间，单位：秒 */
  currentTime: Ref<number>;
  /** 当前播放总时长，单位：秒 */
  durationTime: Ref<number>;
  /** 视频流宽度，仅用作比例计算 */
  resolutionWidth: Ref<number | undefined>;
  /** 视频流高度，仅用作比例计算 */
  resolutionHeight: Ref<number | undefined>;
  /** 视频流是否为竖状比例 */
  isPortraitResolutionRate: ComputedRef<boolean>;
  /** 暂无直播是否显示 */
  noneLiveVisible: ComputedRef<boolean>;
  /** 播放器控制栏是否显示 */
  playerControlVisible: Ref<boolean>;
  /** sdk 播放器 UI 控制栏是否显示 */
  sdkPlayerUIControlVisible: Ref<boolean>;
  /** 是否为音频播放器模式。注意，目前只有竖屏在使用 */
  isAudioPlayerMode: Ref<boolean>;
  /** 是否支持时间轴标记 */
  supportTimeAxisMark: Ref<boolean>;
  /** 是否支持直播时移 */
  supportLiveTimeShift: Ref<boolean>;
}

export interface PlayerStoreAction {
  /** 配置播放器 Store 数据 */
  syncPlayerStore: () => void;
  /** 同步暖场设置 */
  syncWarmUpSetting: () => void;
  /** 同步播放器信息 */
  syncPlayerInfo: () => void;
}

export interface PlayerStore extends PlayerStoreState, PlayerStoreAction {}

export const usePlayerStore = defineStore<'player', PlayerStore>('player', () => {
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();

  /** 配置是否使用播放器 */
  const playerEnabled = ref(true);

  /** 播放器是否已初始化 */
  const playerInited = ref(false);

  /** 是否已开始播放 */
  const isPlayStarted = ref(false);

  /** 当前播放状态 */
  const playStatus = ref<PlayStatus>(PlayStatus.Pause);

  /** 是否支持无延迟观看 */
  const supportLowLatency = ref(false);

  /** 是否无延迟观看 */
  const isLowLatency = ref(false);

  /** 播放器暖场设置 */
  const warmUpSetting = ref<PlayerWarmUpSetting>({
    warmUpType: undefined,
    warmUpImg: undefined,
    warmUpVideo: undefined,
    warmUpHref: undefined,
  });

  /** 是否显示播放器暖场图片 */
  const showWarmUpImg = computed<boolean>(() => {
    if (playbackStore.isPlaybacking) {
      return false;
    }

    const isNotPlaying = playStatus.value !== PlayStatus.Playing;
    return (
      // 播放器已初始化
      unref(playerInited) &&
      // 有暖场图
      !!warmUpSetting.value.warmUpImg &&
      // 还没开始播放 || 不处于播放中状态
      (!unref(isPlayStarted) || isNotPlaying)
    );
  });

  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  const showAudioLivePlaceholder = computed<boolean>(() => {
    const isPlaying = playStatus.value === PlayStatus.Playing;

    return (
      // 播放器已初始化
      unref(playerInited) &&
      // 处于播放中状态
      isPlaying &&
      // 只有音频直播的情况
      unref(channelStore.isCustomLiveAudioMode)
    );
  });

  /** 播放器 logo 设置 */
  const logoSetting = ref<PlayerLogoSetting>({
    logoImage: undefined,
    logoHref: undefined,
    logoOpacity: 1,
    logoPosition: 'tl',
  });

  /** 弹幕设置 */
  const barrageSetting = ref<BarrageSetting>({
    barrageEnabled: false,
    barrageDefaultShow: false,
    barrageSpeed: 200,
  });

  /** 弹幕显示状态 */
  const barrageShow = ref(false);

  /** 是否支持弹幕速度切换 */
  const supportBarrageSpeed = ref(false);

  /** 弹幕速度 */
  const barrageSpeed = ref(200);

  /** 弹幕设置是否显示 */
  const barrageMobileSettingVisible = ref(false);

  /** 是否处于一个可播放的模式 */
  const isPlayMode = computed<boolean>(() => {
    if (!playerEnabled.value) return false;

    // 回放中
    if (playbackStore.isPlaybacking) {
      return true;
    }

    // 直播中
    if (channelStore.liveStatus === LiveStatus.Live) {
      return true;
    }

    // 没有直播中，但有暖场视频
    if (warmUpSetting.value.warmUpType === WarmUpType.Video) {
      return true;
    }

    return false;
  });

  /** 播放器延迟时间 */
  const delayTime = ref(0);

  /** 是否支持刷新 api */
  const supportRefresh = ref(false);

  /** 是否支持自动播放 */
  const supportAutoPlay = ref(false);

  /** 当前音量 */
  const currentVolume = ref(0.5);

  /** 总线路数 */
  const lineCount = ref(0);

  /** 当前线路索引 */
  const currentLine = ref(0);

  /** 可选的清晰度列表 */
  const qualityLevels = ref<QualityLevelItem[]>([]);

  /** 当前清晰度级别 */
  const currentQualityLevel = ref<number>(0);

  /** 可选的倍速列表 */
  const rateList = ref<number[]>([]);

  /** 当前倍速 */
  const currentRate = ref(0);

  /** 当前播放时间 */
  const currentTime = ref(0);

  /** 当前播放总时长 */
  const durationTime = ref(0);

  /** 视频流宽度，仅用作比例计算 */
  const resolutionWidth = ref<number>();

  /** 视频流高度，仅用作比例计算 */
  const resolutionHeight = ref<number>();

  /** 视频流是否为竖状比例 */
  const isPortraitResolutionRate = computed<boolean>(() => {
    const width = unref(resolutionWidth);
    const height = unref(resolutionHeight);
    if (!width || !height) {
      return false;
    }
    return height > width;
  });

  /** 暂无直播是否显示 */
  const noneLiveVisible = computed<boolean>(() => {
    // 直播中
    if (channelStore.liveStatus === LiveStatus.Live) {
      return false;
    }

    // 回放中
    if (playbackStore.isPlaybacking) {
      return false;
    }

    // 非直播中但存在暖场视频
    if (warmUpSetting.value.warmUpType === WarmUpType.Video) {
      return false;
    }

    return (
      // 播放器初始化完毕
      unref(playerInited) &&
      // 没显示暖场
      !unref(showWarmUpImg)
    );
  });

  /** 是否为音频播放器模式 */
  const isAudioPlayerMode = ref(false);

  /** 播放器控制栏是否显示 */
  const playerControlVisible = ref(false);

  /** sdk 播放器 UI 控制栏是否显示 */
  const sdkPlayerUIControlVisible = ref(false);

  /** 是否支持时间轴标记 */
  const supportTimeAxisMark = ref(false);

  /** 是否支持直播时移 */
  const supportLiveTimeShift = ref(false);

  /** 同步播放器 Store 数据 */
  function syncPlayerStore() {
    const watchCore = getWatchCore();

    // 播放器配置无延迟
    if (watchCore.player.supportLowLatency().support) {
      isLowLatency.value = true;
    }

    const _logoSetting = watchCore.player.getPlayerLogoSetting();
    logoSetting.value = _logoSetting;

    const _barrageSetting = watchCore.barrage.getBarrageSetting();
    barrageSetting.value = _barrageSetting;
    barrageShow.value = _barrageSetting.barrageDefaultShow;

    syncWarmUpSetting();
  }

  /** 同步暖场设置 */
  function syncWarmUpSetting() {
    const watchCore = getWatchCore();
    const _warmUpSetting = watchCore.player.getPlayerWarmUpSetting();
    warmUpSetting.value = _warmUpSetting;
  }

  /** 同步播放器信息 */
  function syncPlayerInfo(): void {
    const watchCore = getWatchCore();

    const playerInfo = watchCore.player.getPlayerInfo();

    supportLowLatency.value = playerInfo.supportLowLatency;
    supportRefresh.value = playerInfo.supportRefresh;
    supportAutoPlay.value = playerInfo.supportAutoPlay;

    lineCount.value = playerInfo.lineCount;
    currentLine.value = playerInfo.currentLine;

    qualityLevels.value = playerInfo.qualityLevels;
    currentQualityLevel.value = playerInfo.currentQualityLevel;

    rateList.value = playerInfo.rateList;
    currentRate.value = playerInfo.currentRate;
    currentTime.value = playerInfo.currentTime;
    durationTime.value = playerInfo.durationTime;

    supportBarrageSpeed.value = playerInfo.supportBarrageSpeed;
    barrageSpeed.value = playerInfo.currentBarrageSpeed;

    delayTime.value = playerInfo.delayTime;
    playStatus.value = playerInfo.playStatus;
    isLowLatency.value = playerInfo.isLowLatency;

    /**
     * 暂不支持三分屏场景和研讨会场景
     * 暂不支持移动端竖屏
     */
    if (
      !channelStore.isPptChannel &&
      !channelStore.isSeminarChannel &&
      !layoutStore.isPortraitWatchLayout
    ) {
      supportTimeAxisMark.value = playerInfo.supportTimeAxisMark;
      supportLiveTimeShift.value = playerInfo.supportLiveTimeShift;
    }
  }

  return {
    playerEnabled,
    isAudioPlayerMode,
    isPlayMode,
    playerInited,
    isPlayStarted,
    playStatus,
    warmUpSetting,
    showWarmUpImg,
    showAudioLivePlaceholder,
    logoSetting,

    barrageSetting,
    barrageShow,
    supportBarrageSpeed,
    barrageSpeed,
    barrageMobileSettingVisible,

    delayTime,
    supportLowLatency,
    isLowLatency,
    supportRefresh,
    supportAutoPlay,
    currentVolume,

    lineCount,
    currentLine,

    qualityLevels,
    currentQualityLevel,

    rateList,
    currentRate,

    currentTime,
    durationTime,

    resolutionWidth,
    resolutionHeight,
    isPortraitResolutionRate,
    noneLiveVisible,
    playerControlVisible,
    sdkPlayerUIControlVisible,

    supportTimeAxisMark,
    supportLiveTimeShift,

    syncPlayerStore,
    syncWarmUpSetting,
    syncPlayerInfo,
  };
});
