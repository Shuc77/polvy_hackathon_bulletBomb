/**
 * @file 频道 store
 */
import { DEFAULT_VERIFY_QUERY_FREQUENCY } from '@/assets/constants/defaults';
import { isMobile } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import {
  ChannelDetail,
  ChannelScene,
  ChannelWatchLayout,
  ChatMessageUser,
  ChatUserTypes,
  LiveStatus,
  YN,
  StreamType,
  MarqueeData,
} from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

export interface ChannelStoreState {
  /** 频道详情数据 */
  channelDetail: Ref<ChannelDetail | undefined>;
  /** 频道号 */
  channelId: ComputedRef<string>;
  /** 频道是否处于测试模式 */
  testModeStatus: Ref<boolean>;
  /** 频道直播状态 */
  liveStatus: Ref<LiveStatus>;
  /** 频道直播状态（根据测试模式返回） */
  liveStatusByDebug: ComputedRef<LiveStatus>;
  /** 当前最新的直播场次号 */
  currentSessionId: Ref<string>;
  /** 观看页地址 */
  watchUrl: ComputedRef<string>;
  /** 是否为普通直播频道 */
  isAloneChannel: ComputedRef<boolean>;
  /** 是否为三分屏频道 */
  isPptChannel: ComputedRef<boolean>;
  /** 是否为研讨会频道 */
  isSeminarChannel: ComputedRef<boolean>;
  /** 渠道 id */
  promoteId: Ref<string | undefined>;
  /** 当前频道是否为音频直播 */
  isOnlyAudioLive: ComputedRef<boolean>;
  /** 讲师信息 */
  teacherInfo: ComputedRef<ChatMessageUser>;
  /** 观看页移动端布局 */
  mobileWatchLayout: ComputedRef<ChannelWatchLayout>;
  /** 是否为竖屏观看页布局 */
  isPortraitWatchLayout: ComputedRef<boolean>;
  /** 当前直播推流类型 */
  currentStreamType: Ref<StreamType | undefined>;
  /** 跑马灯数据 */
  marqueeData: Ref<MarqueeData | undefined>;
  /** 唯一登录校验轮训频率，单位：秒 */
  channelVerifyQueryFrequency: Ref<number>;
}

export interface ChannelStoreActions {
  /** 同步频道详情 */
  syncChannelDetail: () => void;
  /** 同步频道 store */
  syncChannelStore: () => void;
}

/** 频道 store */
export interface ChannelStore extends ChannelStoreState, ChannelStoreActions {}

export const useChannelStore = defineStore<'channel', ChannelStore>('channel', () => {
  const channelDetail = ref<ChannelDetail>();

  /** 频道号 */
  const channelId = computed(() => `${unref(channelDetail)?.channelInfo.channelId || ''}`);

  /** 频道是否处于测试模式 */
  const testModeStatus = ref(false);

  /** 频道直播状态 */
  const liveStatus = ref<LiveStatus>(LiveStatus.End);

  /** 频道直播状态（根据测试模式返回） */
  const liveStatusByDebug = computed<LiveStatus>(() => {
    // 测试模式为避免暴露直播信息，固定设成暂无直播，testModeStatus 类似于 pageWatch.isDebug，用于判断测试模式。
    if (unref(testModeStatus)) {
      return LiveStatus.End;
    }
    return unref(liveStatus);
  });

  /** 当前直播场次号 */
  const currentSessionId = ref('');

  /** 观看页地址 */
  const watchUrl = computed(() => unref(channelDetail)?.channelInfo?.watchCodeUrl || '');

  /** 是否为普通直播频道 */
  const isAloneChannel = computed(
    () => unref(channelDetail)?.channelInfo?.scene === ChannelScene.Alone,
  );

  /** 是否为三分屏频道 */
  const isPptChannel = computed(
    () => unref(channelDetail)?.channelInfo?.scene === ChannelScene.Ppt,
  );

  /** 是否为研讨会频道 */
  const isSeminarChannel = computed(
    () => unref(channelDetail)?.channelInfo?.scene === ChannelScene.Seminar,
  );

  /** 观看页移动端布局 */
  const mobileWatchLayout = computed<ChannelWatchLayout>(() => {
    return channelDetail.value?.channelInfo.watchLayout || ChannelWatchLayout.Normal;
    // return ChannelWatchLayout.Normal;
  });

  /** 是否为竖屏观看页布局 */
  const isPortraitWatchLayout = computed<boolean>(() => {
    return unref(mobileWatchLayout) === ChannelWatchLayout.Portrait && isMobile;
  });

  /** 渠道 id */
  const promoteId = ref<string>();

  /** 当前频道是否为音频直播 */
  const isOnlyAudioLive = computed<boolean>(() => {
    return ynToBool(unref(channelDetail)?.channelConfig.audioOnlyEnabled, YN.N);
  });

  /** 当前直播推流类型 */
  const currentStreamType = ref<StreamType>();

  /** 讲师信息 */
  const teacherInfo = computed<ChatMessageUser>(() => {
    const detailVal = unref(channelDetail);
    return {
      userId: unref(channelId),
      nick: detailVal?.channelTeacher?.nickName || '',
      pic: detailVal?.channelTeacher?.avatar || '',
      userType: ChatUserTypes.Teacher,
      actor: detailVal?.channelTeacher?.actor,
    };
  });

  /** 跑马灯数据 */
  const marqueeData = ref<MarqueeData>();

  const channelVerifyQueryFrequency = ref(DEFAULT_VERIFY_QUERY_FREQUENCY);

  /** 同步频道详情 */
  function syncChannelDetail() {
    const watchCore = getWatchCore();
    channelDetail.value = watchCore.channel.getChannelDetail();
  }

  function syncChannelStore(): void {
    const watchCore = getWatchCore();
    testModeStatus.value = watchCore.channel.getTestModeStatus();
    liveStatus.value = watchCore.channel.getLiveStatus();
    currentSessionId.value = watchCore.channel.getCurrentSessionId();
    promoteId.value = watchCore.channel.getPromoteId();
  }

  return {
    channelDetail,
    syncChannelDetail,
    syncChannelStore,

    channelId,
    testModeStatus,
    liveStatus,
    liveStatusByDebug,
    currentSessionId,
    watchUrl,
    isAloneChannel,
    isPptChannel,
    isSeminarChannel,
    mobileWatchLayout,
    isPortraitWatchLayout,
    promoteId,
    isOnlyAudioLive,
    teacherInfo,
    currentStreamType,
    marqueeData,
    channelVerifyQueryFrequency,
  };
});
