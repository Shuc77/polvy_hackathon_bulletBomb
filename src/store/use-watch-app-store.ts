import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';

import { paramGetter } from '@/hooks/core/use-query-params';
import { appEvents, eventBus } from '@/app/app-events';

import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorData, PageErrorType } from '@/app/layout/page-error/page-error-type';

import { useAuthStore } from './use-auth-store';
import { useEnrollStore } from './use-enroll-store';
import { usePlaybackStore } from './use-playback-store';
import { usePlayerStore } from './use-player-store';
import { useDocStore } from './use-doc-store';
import { useChatStore } from './use-chat-store';
import { useConnectMicStore } from './use-connect-mic-store';
import { useSyncStoreForWatchPage } from '@/hooks/core/use-sync-store';
import { useMultiMeetingRedirect } from '@/components/page-watch-common/multi-meeting/hooks/use-multi-meeting-redirect';
import { translate } from '@/assets/lang';
import { PlaybackWatchBasicInfo, LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelStore } from './use-channel-store';

export interface WatchAppStoreState {
  /** 当前是否处于回放观看页地址 */
  isPlaybackWatchUrl: Ref<boolean>;
  /** 回放观看页基本信息 */
  playbackWatchBasicInfo: Ref<PlaybackWatchBasicInfo>;
  /** 当前是否为微信小程序 webview 环境 */
  isWxMiniProgram: Ref<boolean>;
  /** 是否为会议模式 */
  meetingMode: Ref<boolean>;
  /** 是否 iframe 模式 */
  iframeMode: Ref<boolean>;
  /** 页面异常数据 */
  pageError: Ref<PageErrorData | undefined>;
  /** 观看页应用初始化完毕 */
  watchAppInited: Ref<boolean>;

  /**
   * 由于单页面没有路由机制，所以通过标志位来销毁组件
   * @warn shouldShowForceAuth、shouldShowSplash、watchPageInited 三个变量只能有一个为 true
   */

  /** 是否显示强制授权页 - 强制授权页标识位 */
  shouldShowForceAuth: Ref<boolean>;
  /** 是否显示引导页 - 引导页渲染标识位 */
  shouldShowSplash: ComputedRef<boolean>;
  /** 直播观看页是否初始化完毕 - 直播观看页渲染标识位 */
  watchPageInited: Ref<boolean>;
}

export interface WatchAppStoreActions {
  /** 设置页面错误数据 */
  setPageError(param: PageErrorData): void;
  /** 重置 watchCore */
  resetUpWatchCore(): Promise<void>;
  /** 同步 watchAppStore 数据 */
  syncWatchAppStore(): void;
  /** 设置直播观看页 */
  setupLiveWatch(): Promise<void>;
  /** 暂停直播观看页部分功能的初始化 */
  pauseConnectLiveWatch(): void;
  /** 恢复直播观看页部分功能的初始化 */
  recoverConnectLiveWatch(): void;
  /** 连接聊天室 */
  setupWatchCoreConnect(): void;
}

export interface WatchAppStore extends WatchAppStoreState, WatchAppStoreActions {}

export const useWatchAppStore = defineStore<'watchApp', WatchAppStore>('watchApp', () => {
  const { syncStoreBeforeWatchPageInited } = useSyncStoreForWatchPage();
  const { checkRedirectSubChannel } = useMultiMeetingRedirect();

  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();

  const channelStore = useChannelStore();
  const docStore = useDocStore();
  const playbackStore = usePlaybackStore();
  const playerStore = usePlayerStore();
  const chatStore = useChatStore();
  const connectMicStore = useConnectMicStore();

  /** 当前是否处于回放观看页地址 */
  const isPlaybackWatchUrl = ref(false);

  /** 回放观看页基本信息 */
  const playbackWatchBasicInfo = ref<PlaybackWatchBasicInfo>({});

  /** 当前是否为微信小程序 webview 环境 */
  const isWxMiniProgram = ref(false);

  /** 是否为会议模式 */
  const meetingMode = ref(paramGetter.polyvMeeting() === 'true');

  /** 是否 iframe 模式 */
  const iframeMode = ref(paramGetter.hasFrame() === '1');

  /** 页面异常数据 */
  const pageError = ref<PageErrorData>();

  /** 观看页应用初始化完毕 */
  const watchAppInited = ref(false);

  /** 是否显示强制授权页 */
  const shouldShowForceAuth = ref(false);

  /** 是否显示引导页 */
  const shouldShowSplash = computed(() => {
    if (shouldShowForceAuth.value) return false;

    return !authStore.isAuthorized || enrollStore.needEnrollByEnter;
  });

  /** 直播观看页是否初始化完毕 */
  const watchPageInited = ref(false);

  /** 设置页面异常数据 */
  function setPageError(param: PageErrorData) {
    // 只设置一次
    if (pageError.value) return;

    pageError.value = param;
  }

  /** 重置 watchCore */
  async function resetUpWatchCore(): Promise<void> {
    try {
      const watchCore = getWatchCore();
      await watchCore.setup();
    } catch (error) {
      setPageError({
        type: PageErrorType.UnknownError,
        title: translate('pageError.channel.unknowError'),
        desc: translate('pageError.channel.feedBack'),
      });
      console.error('resetUpWatchCore error', error);
      // 需要抛出主流程阻塞的异常
      throw new Error('页面初始化失败！');
    }
  }

  /** 同步 watchAppStore 数据 */
  function syncWatchAppStore() {
    const watchCore = getWatchCore();

    shouldShowForceAuth.value = watchCore.weixin.checkForceWxAuth();
    isPlaybackWatchUrl.value = watchCore.isPlaybackWatchByVid();
    playbackWatchBasicInfo.value = watchCore.getPlaybackWatchBasicInfo();
  }

  /** 设置观看页 */
  async function setupLiveWatch(): Promise<void> {
    // 从分会场跳转到主会场并授权成功，则跳回对应的分会场，跳转后阻止观看页渲染
    const checkResult = checkRedirectSubChannel();
    if (checkResult) {
      return;
    }

    // 同步相关 store 的数据
    syncStoreBeforeWatchPageInited();

    // 初始化当前回放对象
    await playbackStore.initCurrentPlaybackTarget();

    // 根据不同场景设置 watchPageInited 标识位
    await __setWatchPageInited();
  }

  /** 根据不同场景设置 watchPageInited 标识位 */
  async function __setWatchPageInited() {
    /**
     * 不需要连麦，不需要连接聊天室
     * @scene 回放观看页地址进入观看页
     * @scene 研讨会处于"内部研讨"时不需要连接聊天室
     * @scene 研讨会处于回放时不需要连接聊天室
     */
    if (
      isPlaybackWatchUrl.value ||
      channelStore.privateSeminarChannel ||
      (channelStore.isSeminarChannel && channelStore.liveStatus === LiveStatus.Playback)
    ) {
      connectMicStore.$patch({ connectMicEnabled: false });
      watchPageInited.value = true;
      return;
    }

    // 正常进入观看页，建立 socket 连接
    await setupWatchCoreConnect();
    watchPageInited.value = true;
  }

  /**
   * 设置观看核心连接 Socket 处理
   */
  async function setupWatchCoreConnect() {
    const watchCore = getWatchCore();
    await watchCore.connect();
  }

  /**
   * 暂停直播观看页部分功能的初始化
   * */
  async function pauseConnectLiveWatch() {
    playerStore.$patch({ playerEnabled: false });
    docStore.$patch({ docEnabled: false });
    chatStore.$patch({ chatMsgListEnabled: false });
    connectMicStore.$patch({ connectMicEnabled: false });
  }

  /**
   * 恢复直播观看页部分功能的初始化
   */
  async function recoverConnectLiveWatch() {
    playerStore.$patch({ playerEnabled: true });
    docStore.$patch({ docEnabled: true });
    chatStore.$patch({ chatMsgListEnabled: true });

    /**
     * 不需要连麦，不需要连接聊天室
     * @scene 回放观看页地址进入观看页
     * @scene 研讨会处于"内部研讨"时不需要连接聊天室
     * @scene 研讨会处于回放时不需要连接聊天室
     */
    if (
      !isPlaybackWatchUrl.value ||
      channelStore.privateSeminarChannel ||
      (channelStore.isSeminarChannel && channelStore.liveStatus === LiveStatus.Playback)
    ) {
      connectMicStore.$patch({ connectMicEnabled: true });
      await setupWatchCoreConnect();
    }

    eventBus.$emit(appEvents.player.ResetUpPlayer);
    eventBus.$emit(appEvents.doc.ResetUpDoc);
    eventBus.$emit(appEvents.chat.ResetUpChatMsgList);
    eventBus.$emit(appEvents.connectMic.ResetUpConnectMic);
  }

  return {
    isPlaybackWatchUrl,
    playbackWatchBasicInfo,
    isWxMiniProgram,
    meetingMode,
    iframeMode,
    pageError,
    watchAppInited,
    shouldShowForceAuth,
    shouldShowSplash,
    watchPageInited,

    setPageError,
    resetUpWatchCore,
    syncWatchAppStore,
    setupLiveWatch,

    pauseConnectLiveWatch,
    recoverConnectLiveWatch,

    setupWatchCoreConnect,
  };
});
