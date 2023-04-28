/**
 * @file 播放器 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import {
  PlayStatus,
  QualityLevelItem,
  LiveStatus,
  WarmUpType,
  PlayerLogoPosition,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
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
  /** 暖场类型 */
  warmUpType: Ref<string | undefined>;
  /** 暖场图片/播放器封面图 */
  warmUpImg: Ref<string | undefined>;
  /** 暖场图片跳转地址 */
  warmUpHref: Ref<string | undefined>;
  /** 是否显示播放器暖场图片 */
  showWarmUpImg: ComputedRef<boolean>;
  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  showAudioLivePlaceholder: ComputedRef<boolean>;
  /** 播放器 logo 图片地址 */
  logoImage: ComputedRef<string | undefined>;
  /** 播放器 logo 跳转地址 */
  logoHref: ComputedRef<string | undefined>;
  /** 播放器 logo 透明度 */
  logoOpacity: ComputedRef<number>;
  /** 播放器 logo 位置 */
  logoPosition: ComputedRef<PlayerLogoPosition>;
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
  /** 后台中的弹幕开关 */
  barrageBackstageEnabled: Ref<boolean>;
  /** 弹幕显示状态 */
  barrageShow: Ref<boolean>;
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
  /** 是否为音频播放器模式。注意，目前只有竖屏在使用 */
  isAudioPlayerMode: Ref<boolean>;
}

export interface PlayerStoreAction {
  /** 同步播放器信息 */
  syncPlayerInfo: () => void;
}

export interface PlayerStore extends PlayerStoreState, PlayerStoreAction {}

export const usePlayerStore = defineStore<'player', PlayerStore>('player', () => {
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();

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

  /** 暖场类型 */
  const warmUpType = ref<WarmUpType>();

  /** 暖场图片/播放器封面图 */
  const warmUpImg = ref<string>();

  /** 暖场图片跳转地址 */
  const warmUpHref = ref<string>();

  /** 是否显示播放器暖场图片 */
  const showWarmUpImg = computed<boolean>(() => {
    if (playbackStore.isPlaybacking || channelStore.liveStatus !== LiveStatus.Live) {
      return false;
    }

    const isNotPlaying = playStatus.value !== PlayStatus.Playing;
    return unref(playerInited) && !!unref(warmUpImg) && (!unref(isPlayStarted) || isNotPlaying);
  });

  /** 是否显示播放器在“音频直播”场景下的占位区域 */
  const showAudioLivePlaceholder = computed<boolean>(() => {
    const isPlaying = playStatus.value === PlayStatus.Playing;
    return unref(playerInited) && isPlaying && unref(channelStore.isOnlyAudioLive);
  });

  /** 播放器 logo 图片地址 */
  const logoImage = computed<string | undefined>(() => {
    return channelStore.channelDetail?.playerSetting?.logoImage ?? undefined;
  });

  /** 播放器 logo 跳转地址 */
  const logoHref = computed<string | undefined>(() => {
    return channelStore.channelDetail?.playerSetting?.logoHref ?? undefined;
  });

  /** 播放器 logo 透明度 */
  const logoOpacity = computed<number>(() => {
    return channelStore.channelDetail?.playerSetting?.logoOpacity ?? 1;
  });

  /** 播放器 logo 位置 */
  const logoPosition = computed<PlayerLogoPosition>(() => {
    return channelStore.channelDetail?.playerSetting?.logoPosition ?? 'tl';
  });

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
    if (warmUpType.value === WarmUpType.Video) {
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

  /** 后台中的弹幕开关 */
  const barrageBackstageEnabled = ref(false);

  /** 弹幕显示状态 */
  const barrageShow = ref(true);

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
    if (warmUpType.value === WarmUpType.Video) {
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

  /** 同步播放器信息 */
  function syncPlayerInfo(): void {
    const watchCore = getWatchCore();
    const playerInfo = watchCore.player.getPlayerInfo();

    warmUpType.value = playerInfo.warmUpType;
    warmUpImg.value = playerInfo.warmUpImg;
    warmUpHref.value = playerInfo.warmUpHref;
    delayTime.value = playerInfo.delayTime;
    supportRefresh.value = playerInfo.supportRefresh;
    supportAutoPlay.value = playerInfo.supportAutoPlay;
    barrageBackstageEnabled.value = playerInfo.barrageBackstageEnabled;
    playStatus.value = playerInfo.playStatus;
    lineCount.value = playerInfo.lineCount;
    currentLine.value = playerInfo.currentLine;
    qualityLevels.value = playerInfo.qualityLevels;
    currentQualityLevel.value = playerInfo.currentQualityLevel;
    rateList.value = playerInfo.rateList;
    currentRate.value = playerInfo.currentRate;
    currentTime.value = playerInfo.currentTime;
    durationTime.value = playerInfo.durationTime;
    supportLowLatency.value = playerInfo.supportLowLatency;
    isLowLatency.value = playerInfo.isLowLatency;
  }

  return {
    playerEnabled,
    isAudioPlayerMode,
    isPlayMode,
    playerInited,
    isPlayStarted,
    playStatus,
    warmUpType,
    warmUpImg,
    warmUpHref,
    showWarmUpImg,
    showAudioLivePlaceholder,
    logoImage,
    logoHref,
    logoOpacity,
    logoPosition,
    delayTime,
    supportLowLatency,
    isLowLatency,
    supportRefresh,
    supportAutoPlay,
    currentVolume,
    barrageBackstageEnabled,
    barrageShow,
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
    syncPlayerInfo,
  };
});
