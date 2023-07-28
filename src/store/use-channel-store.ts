/**
 * @file 频道 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import {
  ChannelAudioMode,
  ChannelScene,
  LiveStatus,
  StreamType,
  TeacherInfoType,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

export interface ChannelStoreState {
  /** 频道号 */
  channelId: Ref<string>;
  /** 频道直播状态 */
  liveStatus: Ref<LiveStatus>;
  /** 当前最新的直播场次号 */
  currentSessionId: Ref<string>;
  /** 观看页地址 */
  watchUrl: Ref<string>;
  /** 是否为普通直播频道 */
  isAloneChannel: ComputedRef<boolean>;
  /** 是否为三分屏频道 */
  isPptChannel: ComputedRef<boolean>;
  /** 是否为研讨会频道 */
  isSeminarChannel: ComputedRef<boolean>;
  /** 渠道 id */
  promoteId: Ref<string | undefined>;
  /** 音频模式 */
  audioMode: Ref<ChannelAudioMode>;
  /** 是否可以“切换音视频模式” */
  audioModeSwitchEnabled: Ref<boolean>;
  /** 当前频道是否为特殊的音频直播 */
  isCustomLiveAudioMode: ComputedRef<boolean>;
  /** 讲师信息 */
  teacherInfo: Ref<TeacherInfoType | undefined>;
  /** 当前直播推流类型 */
  currentStreamType: Ref<StreamType | undefined>;
}

export interface ChannelStoreActions {
  /** 同步频道 Store 数据 */
  syncChannelStore: () => void;
}

/** 频道 store */
export interface ChannelStore extends ChannelStoreState, ChannelStoreActions {}

export const useChannelStore = defineStore<'channel', ChannelStore>('channel', () => {
  /** 频道号 */
  const channelId = ref('');

  /** 频道直播状态 */
  const liveStatus = ref<LiveStatus>(LiveStatus.End);

  /** 当前直播场次号 */
  const currentSessionId = ref('');

  /** 观看页地址 */
  const watchUrl = ref('');

  /** 频道场景 */
  const channelScene = ref<ChannelScene>();

  /** 是否为普通直播频道 */
  const isAloneChannel = computed(() => unref(channelScene) === ChannelScene.Alone);

  /** 是否为三分屏频道 */
  const isPptChannel = computed(() => unref(channelScene) === ChannelScene.Ppt);

  /** 是否为研讨会频道 */
  const isSeminarChannel = computed(() => unref(channelScene) === ChannelScene.Seminar);

  /** 渠道 id */
  const promoteId = ref<string>();

  /** 音频模式 */
  const audioMode = ref(ChannelAudioMode.NormalAudio);

  /** 是否可以“切换音视频模式” */
  const audioModeSwitchEnabled = ref(false);

  /** 当前频道是否为特殊的音频直播 */
  const isCustomLiveAudioMode = computed(
    () => audioMode.value === ChannelAudioMode.CustomLiveAudio,
  );

  /** 当前直播推流类型 */
  const currentStreamType = ref<StreamType>();

  /** 讲师信息 */
  const teacherInfo = ref<TeacherInfoType>();

  /** 同步频道 Store 数据 */
  function syncChannelStore(): void {
    const watchCore = getWatchCore();

    channelScene.value = watchCore.channel.getChannelScene();
    liveStatus.value = watchCore.channel.getLiveStatus();
    currentSessionId.value = watchCore.channel.getCurrentSessionId();
    promoteId.value = watchCore.channel.getPromoteId();
    watchUrl.value = watchCore.channel.getChannelWatchUrl();
    teacherInfo.value = watchCore.channel.getTeacherInfo();

    audioMode.value = watchCore.channel.getAudioMode();
    audioModeSwitchEnabled.value = watchCore.channel.getAudioModeSwitchEnabled();
  }

  return {
    channelId,
    liveStatus,
    currentSessionId,
    watchUrl,
    isAloneChannel,
    isPptChannel,
    isSeminarChannel,
    promoteId,
    audioMode,
    audioModeSwitchEnabled,
    isCustomLiveAudioMode,
    teacherInfo,
    currentStreamType,

    syncChannelStore,
  };
});
