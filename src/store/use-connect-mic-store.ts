import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import {
  ConnectMicItem,
  ConnectMicStatus,
  ConnectMicType,
  NetworkStatus,
  UplinkNetworkQuality,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

export interface ConnectMicStoreState {
  /** 配置是否使用连麦 */
  connectMicEnabled: Ref<boolean>;
  /** 当前环境是否支持连麦 */
  supportConnectMic: Ref<boolean>;
  /** 是否开启了连麦 */
  openMicStatus: Ref<boolean>;
  /** 连麦类型 */
  connectMicType: Ref<ConnectMicType>;
  /** 用户连麦状态 */
  connectMicStatus: Ref<ConnectMicStatus>;
  /** 当前用户是否正在连麦中 */
  isConnectMicing: ComputedRef<boolean>;
  /** 连麦列表 */
  connectMicList: Ref<ConnectMicItem[]>;
  /** 过滤后的连麦列表（移除主讲流） */
  filterConnectMicList: ComputedRef<ConnectMicItem[]>;
  /** 主讲流对象 */
  masterMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 当前连麦用户是否为主讲 */
  masterIsSelf: ComputedRef<boolean>;
  /** 主讲流是否关闭摄像头 */
  masterIsVideoMuted: ComputedRef<boolean>;
  /** 主讲流是否关闭麦克风 */
  masterIsAudioMuted: ComputedRef<boolean>;
  /** 主讲头衔 */
  masterActor: ComputedRef<string | undefined>;
  /** 主讲昵称 */
  masterNickname: ComputedRef<string | undefined>;
  /** 主讲的连麦方式 */
  masterConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 本地流对象 */
  localMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 本地流是否关闭摄像头 */
  localIsVideoMuted: ComputedRef<boolean>;
  /** 本地流是否关闭麦克风 */
  localIsAudioMuted: ComputedRef<boolean>;
  /** 本地流的连麦方式 */
  localConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 连麦上行网络质量 */
  uplinkNetworkQuality: Ref<UplinkNetworkQuality>;
  /** 连麦上行网络状态 */
  uplinkNetworkStatus: Ref<NetworkStatus>;
}

export interface ConnectMicStoreAction {
  /** 同步连麦信息 */
  syncConnectMicInfo(): void;
  /** 同步连麦列表 */
  syncConnectMicList(): void;
}

export interface ConnectMicStore extends ConnectMicStoreState, ConnectMicStoreAction {}

/**
 * 连麦 store
 */
export const useConnectMicStore = defineStore<'connectMic', ConnectMicStore>('connectMic', () => {
  /** 配置是否使用连麦 */
  const connectMicEnabled = ref(true);

  /** 当前环境是否支持连麦 */
  const supportConnectMic = ref(true);

  /** 是否开启了连麦 */
  const openMicStatus = ref(false);

  /** 连麦类型 */
  const connectMicType = ref<ConnectMicType>(ConnectMicType.Video);

  /** 用户连麦状态 */
  const connectMicStatus = ref<ConnectMicStatus>(ConnectMicStatus.NotConnect);

  /** 当前用户是否正在连麦中 */
  const isConnectMicing = computed<boolean>(() => {
    const status = unref(connectMicStatus);
    return [ConnectMicStatus.Publishing, ConnectMicStatus.Connected].includes(status);
  });

  /** 连麦列表 */
  const connectMicList: Ref<ConnectMicItem[]> = ref([]);

  /** 过滤连麦列表 */
  const filterConnectMicList = computed(() => {
    const micList = unref(connectMicList);
    const streamList = micList.filter(micItem => {
      return !micItem.isMaster;
    });
    return streamList.sort((prevMicItem, nextMicItem) => {
      if (nextMicItem.isLocal) return 1;
      return -1;
    });
  });

  /** 主讲流对象 */
  const masterMicItem = computed(() => {
    const micList = unref(connectMicList);
    const masterIndex = micList.findIndex(micItem => micItem.isMaster);
    return masterIndex === -1 ? undefined : micList[masterIndex];
  });

  /** 当前连麦用户是否为主讲 */
  const masterIsSelf = computed<boolean>(() => {
    return !!unref(masterMicItem)?.isSelf;
  });

  /** 主讲流是否关闭摄像头 */
  const masterIsVideoMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isVideoMuted ?? false;
  });

  /** 主讲流是否关闭麦克风 */
  const masterIsAudioMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isAudioMuted ?? false;
  });

  /** 主讲头衔 */
  const masterActor = computed<string | undefined>(() => {
    if (unref(masterIsSelf)) {
      return translate('connectMic.me');
    }
    if (unref(masterMicItem)?.isTeacher) {
      return translate('connectMic.teacher');
    }
    return undefined;
  });

  /** 主讲昵称 */
  const masterNickname = computed<string | undefined>(() => {
    return unref(masterMicItem)?.nickname;
  });

  /** 主讲的连麦方式 */
  const masterConnectMicType = computed<ConnectMicType | undefined>(() => {
    return unref(masterMicItem)?.currentConnectMicType;
  });

  /** 本地流对象 */
  const localMicItem = computed(() => {
    const micList = unref(connectMicList);
    const localIndex = micList.findIndex(micItem => micItem.isLocal);
    return localIndex === -1 ? undefined : micList[localIndex];
  });

  /** 本地流是否关闭摄像头 */
  const localIsVideoMuted = computed<boolean>(() => {
    return unref(localMicItem)?.isVideoMuted ?? false;
  });

  /** 本地流是否关闭麦克风 */
  const localIsAudioMuted = computed<boolean>(() => {
    return unref(localMicItem)?.isAudioMuted ?? false;
  });

  /** 本地流的连麦方式 */
  const localConnectMicType = computed<ConnectMicType | undefined>(() => {
    return unref(localMicItem)?.currentConnectMicType;
  });

  /** 连麦上行网络质量 */
  const uplinkNetworkQuality = ref<UplinkNetworkQuality>(0);

  /** 连麦上行网络状态 */
  const uplinkNetworkStatus = ref<NetworkStatus>(NetworkStatus.Unknown);

  function syncConnectMicInfo(): void {
    const watchCore = getWatchCore();
    const connectMicInfo = watchCore.connectMic.getConnectMicInfo();

    supportConnectMic.value = connectMicInfo.supportConnectMic;
    openMicStatus.value = connectMicInfo.openMicStatus;
    connectMicType.value = connectMicInfo.connectMicType;
    connectMicStatus.value = connectMicInfo.connectMicStatus;
    uplinkNetworkQuality.value = connectMicInfo.uplinkNetworkQuality;
    uplinkNetworkStatus.value = connectMicInfo.uplinkNetworkStatus;
  }

  function syncConnectMicList(): void {
    const watchCore = getWatchCore();
    connectMicList.value = watchCore.connectMic.getConnectMicList();
  }

  return {
    connectMicEnabled,
    supportConnectMic,
    openMicStatus,
    connectMicType,
    connectMicStatus,
    isConnectMicing,
    connectMicList,
    filterConnectMicList,
    masterMicItem,
    masterIsSelf,
    masterIsVideoMuted,
    masterIsAudioMuted,
    masterActor,
    masterNickname,
    masterConnectMicType,
    localMicItem,
    localIsVideoMuted,
    localIsAudioMuted,
    localConnectMicType,
    uplinkNetworkQuality,
    uplinkNetworkStatus,
    syncConnectMicInfo,
    syncConnectMicList,
  };
});
