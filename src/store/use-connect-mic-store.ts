import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import {
  ConnectMicItem,
  ConnectMicNetworkInfo,
  ConnectMicStatus,
  ConnectMicType,
  generateDefaultNetworkInfo,
  generateDefaultScreenShareInfo,
  ScreenShareInfo,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useLayoutStore } from './use-layout-store';
import { usePlayerStore } from './use-player-store';

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
  /** 连麦排序显示开关 */
  showJoinQueueNumberEnabled: Ref<boolean>;
  /** 当前连麦请求排序 */
  currentMicIndex: Ref<number>;
  /** 最大显示连麦序号 */
  maxMicIndex: Ref<number>;
  /** 当前用户是否正在连麦中 */
  isConnectMicing: ComputedRef<boolean>;
  /** 连麦挂件是否需要渲染 */
  connectMicPendantRenderEnabled: ComputedRef<boolean>;
  /** 连麦挂件是否显示 */
  connectMicPendantVisible: ComputedRef<boolean>;
  /** 连麦列表 */
  connectMicList: Ref<ConnectMicItem[]>;
  /** 过滤后的连麦列表（移除第一画面） */
  filterConnectMicList: ComputedRef<ConnectMicItem[]>;
  /** 第一画面流对象 */
  masterMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 当前连麦用户是否为第一画面 */
  masterIsSelf: ComputedRef<boolean>;
  /** 第一画面流是否关闭摄像头 */
  masterIsVideoMuted: ComputedRef<boolean>;
  /** 第一画面流是否关闭麦克风 */
  masterIsAudioMuted: ComputedRef<boolean>;
  /** 第一画面头衔 */
  masterActor: ComputedRef<string | undefined>;
  /** 第一画面昵称 */
  masterNickname: ComputedRef<string | undefined>;
  /** 第一画面的连麦方式 */
  masterConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 本地流对象 */
  localMicItem: ComputedRef<ConnectMicItem | undefined>;
  /** 本地流是否关闭摄像头 */
  localIsVideoMuted: ComputedRef<boolean>;
  /** 本地流是否关闭麦克风 */
  localIsAudioMuted: ComputedRef<boolean>;
  /** 本地流的连麦方式 */
  localConnectMicType: ComputedRef<ConnectMicType | undefined>;
  /** 当前是否为主讲 */
  currentIsSpeaker: Ref<boolean>;
  /** 连麦网络信息 */
  networkInfo: Ref<ConnectMicNetworkInfo>;
  /** 屏幕共享信息 */
  screenShareInfo: Ref<ScreenShareInfo>;
  /** 当前推流时能否设置摄像头 */
  supportSetupVideo: ComputedRef<boolean>;
  /** 设备采集失败 */
  isDeviceRecoverFailed: Ref<boolean>;
}

export interface ConnectMicStoreAction {
  /** 同步连麦信息 */
  syncConnectMicInfo(): void;
  /** 同步连麦网络信息 */
  syncNetworkInfo(): void;
  /** 同步屏幕共享信息 */
  syncScreenShareInfo(): void;
  /** 同步连麦列表 */
  syncConnectMicList(): void;
}

export interface ConnectMicStore extends ConnectMicStoreState, ConnectMicStoreAction {}

/**
 * 连麦 store
 */
export const useConnectMicStore = defineStore<'connectMic', ConnectMicStore>('connectMic', () => {
  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();

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

  /** 连麦排序显示开关 */
  const showJoinQueueNumberEnabled = ref(false);

  /** 当前连麦请求排序 */
  const currentMicIndex = ref(-1);

  /** 最大显示连麦序号 */
  const maxMicIndex = ref(50);

  /** 当前用户是否正在连麦中 */
  const isConnectMicing = computed<boolean>(() => {
    const status = unref(connectMicStatus);
    return [ConnectMicStatus.Publishing, ConnectMicStatus.Connected].includes(status);
  });

  /** 连麦挂件是否需要渲染 */
  const connectMicPendantRenderEnabled = computed(() => {
    if (isConnectMicing.value) {
      return true;
    }

    return openMicStatus.value && playerStore.isLowLatency;
  });

  /** 连麦挂件是否显示 */
  const connectMicPendantVisible = computed(() => {
    return (
      !layoutStore.mobileDocIsPageFullscreen &&
      !layoutStore.mobileNormalLatencyPlayerIsFullscreen &&
      !layoutStore.mobilePlayerIsPageFullscreen &&
      !layoutStore.isPageFullscreenOrHorizontalScreen
    );
  });

  /** 连麦列表 */
  const connectMicList: Ref<ConnectMicItem[]> = ref([]);

  /** 过滤连麦列表 */
  const filterConnectMicList = computed(() => {
    const micList = unref(connectMicList);
    const streamList = micList.filter(micItem => {
      return !micItem.isMaster;
    });
    const watchCore = getWatchCore();
    return streamList.sort((prevMicItem, nextMicItem) => {
      if (nextMicItem.isLocal) {
        return 2;
      }
      if (watchCore.user.isSpecialUserType(nextMicItem.userType)) {
        return 1;
      }
      return -1;
    });
  });

  /** 第一画面流对象 */
  const masterMicItem = computed(() => {
    const micList = unref(connectMicList);
    const masterIndex = micList.findIndex(micItem => micItem.isMaster);
    return masterIndex === -1 ? undefined : micList[masterIndex];
  });

  /** 当前连麦用户是否为第一画面 */
  const masterIsSelf = computed<boolean>(() => {
    return !!unref(masterMicItem)?.isSelf;
  });

  /** 第一画面流是否关闭摄像头 */
  const masterIsVideoMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isVideoMuted ?? false;
  });

  /** 第一画面流是否关闭麦克风 */
  const masterIsAudioMuted = computed<boolean>(() => {
    return unref(masterMicItem)?.isAudioMuted ?? false;
  });

  /** 第一画面头衔 */
  const masterActor = computed<string | undefined>(() => {
    if (unref(masterIsSelf)) {
      return translate('connectMic.me');
    }
    if (unref(masterMicItem)?.isTeacher) {
      return translate('connectMic.teacher');
    }
    return undefined;
  });

  /** 第一画面昵称 */
  const masterNickname = computed<string | undefined>(() => {
    return unref(masterMicItem)?.nickname;
  });

  /** 第一画面的连麦方式 */
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

  /** 当前是否为主讲 */
  const currentIsSpeaker = ref(false);

  /** 屏幕共享信息 */
  const screenShareInfo = ref<ScreenShareInfo>(generateDefaultScreenShareInfo());

  /** 设备采集失败 */
  const isDeviceRecoverFailed = ref(false);

  /** 同步屏幕共享信息 */
  function syncScreenShareInfo(): void {
    const watchCore = getWatchCore();
    const info = watchCore.connectMic.getScreenShareInfo();
    screenShareInfo.value = info;
  }

  /** 连麦网络信息 */
  const networkInfo = ref<ConnectMicNetworkInfo>(generateDefaultNetworkInfo());

  /** 同步连麦网络信息 */
  function syncNetworkInfo(): void {
    const watchCore = getWatchCore();
    const info = watchCore.connectMic.getNetworkInfo();
    networkInfo.value = info;
  }

  /** 当前推流时能否设置摄像头 */
  const supportSetupVideo = computed(() => {
    // 音频连麦
    if (connectMicType.value === ConnectMicType.Audio) {
      return false;
    }
    // 当前正在屏幕共享
    if (screenShareInfo.value.isScreenSharing) {
      return false;
    }
    return true;
  });

  function syncConnectMicInfo(): void {
    const watchCore = getWatchCore();
    const connectMicInfo = watchCore.connectMic.getConnectMicInfo();

    supportConnectMic.value = connectMicInfo.supportConnectMic;
    openMicStatus.value = connectMicInfo.openMicStatus;
    connectMicType.value = connectMicInfo.connectMicType;
    connectMicStatus.value = connectMicInfo.connectMicStatus;
    showJoinQueueNumberEnabled.value = connectMicInfo.showJoinQueueNumberEnabled;
    currentMicIndex.value = connectMicInfo.currentMicIndex;
    currentIsSpeaker.value = connectMicInfo.currentIsSpeaker;
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
    showJoinQueueNumberEnabled,
    currentMicIndex,
    maxMicIndex,
    isConnectMicing,
    connectMicPendantRenderEnabled,
    connectMicPendantVisible,
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
    currentIsSpeaker,
    supportSetupVideo,
    isDeviceRecoverFailed,

    networkInfo,
    syncNetworkInfo,

    screenShareInfo,
    syncScreenShareInfo,

    syncConnectMicInfo,
    syncConnectMicList,
  };
});
