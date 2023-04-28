import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';

import { paramGetter } from '@/hooks/core/use-query-params';
import { appEvents, eventBus } from '@/app/app-events';

import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorData } from '@/app/layout/page-error/page-error-type';

import { useAuthStore } from './use-auth-store';
import { useEnrollStore } from './use-enroll-store';
import { usePlaybackStore } from './use-playback-store';
import { usePlayerStore } from './use-player-store';
import { useDocStore } from './use-doc-store';
import { useChatStore } from './use-chat-store';
import { useFinanceStore } from './use-finance-store';
import { useConnectMicStore } from './use-connect-mic-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

export interface WatchAppStoreState {
  /** 当前是否处于回放地址 */
  isWatchBackUrl: Ref<boolean>;
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
  /** 是否显示引导页 - 引导页渲染标识位 */
  shouldShowSplash: ComputedRef<boolean>;
  /** 直播观看页是否初始化完毕 - 直播观看页渲染标识位 */
  liveWatchInited: Ref<boolean>;
}

export interface WatchAppStoreActions {
  resetUpWatchCore(): Promise<void>;
  setupLiveWatch(): Promise<void>;
  /** 设置页面错误数据 */
  setPageError(param: PageErrorData): void;
  pauseConnectLiveWatch(): void;
  recoverConnectLiveWatch(): void;
}

export interface WatchAppStore extends WatchAppStoreState, WatchAppStoreActions {}

export const useWatchAppStore = defineStore<'watchApp', WatchAppStore>('watchApp', () => {
  const authStore = useAuthStore();
  const enrollStore = useEnrollStore();

  const docStore = useDocStore();
  const playbackStore = usePlaybackStore();
  const playerStore = usePlayerStore();
  const chatStore = useChatStore();
  const connectMicStore = useConnectMicStore();

  const channelMenuStore = useChannelMenuStore();
  const financeStore = useFinanceStore();

  /** 当前是否处于回放地址 */
  const isWatchBackUrl = ref(false);

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

  /** 是否显示引导页 */
  const shouldShowSplash = computed(() => {
    return (
      !authStore.isAuthorized ||
      enrollStore.needEnrollByEnter ||
      financeStore.shouldShowSplashByRiskEvaluation
    );
  });

  /** 直播观看页是否初始化完毕 */
  const liveWatchInited = ref(false);

  /** 设置页面异常数据 */
  function setPageError(param: PageErrorData) {
    pageError.value = param;
  }

  /** 重置 watchCore */
  async function resetUpWatchCore(): Promise<void> {
    const watchCore = getWatchCore();
    await watchCore.setup();
  }

  /** 设置观看页 */
  async function setupLiveWatch(): Promise<void> {
    const watchCore = getWatchCore();

    // 优先判断是否为回放地址进入
    isWatchBackUrl.value = watchCore.getIsWatchBackByVid();

    // 初始化当前回放对象
    await playbackStore.initCurrentPlaybackTarget();

    // 播放器配置无延迟
    if (watchCore.player.getLowLatencySupport()) {
      playerStore.$patch({
        isLowLatency: true,
      });
    }

    // 同步相关 store 的数据
    channelMenuStore.syncChannelMenus();
    chatStore.syncChatStore();

    // 根据不同场景设置标识位
    await __setLiveWatchInit();
  }

  /** 根据不同场景设置 liveWatchInited */
  async function __setLiveWatchInit() {
    // 开启风险确认函时，需要暂停部分功能初始化和 Socket 链接
    // 等到观众同意确认后再进行恢复
    if (financeStore.riskConfirmEnabled) {
      pauseConnectLiveWatch();
      liveWatchInited.value = true;
      return;
    }

    // 回放地址进入观看页，不需要连麦
    if (isWatchBackUrl.value) {
      connectMicStore.$patch({ connectMicEnabled: false });
      liveWatchInited.value = true;
      return;
    }

    // 正常进入观看页，建立 socket 连接
    await setupWatchCoreConnect();
    liveWatchInited.value = true;
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

    // 回放地址进观看页不需要 socket 和连麦
    if (!isWatchBackUrl.value) {
      connectMicStore.$patch({ connectMicEnabled: true });
      await setupWatchCoreConnect();
    }

    eventBus.$emit(appEvents.player.ResetUpPlayer);
    eventBus.$emit(appEvents.doc.ResetUpDoc);
    eventBus.$emit(appEvents.chat.ResetUpChatMsgList);
    eventBus.$emit(appEvents.connectMic.ResetUpConnectMic);
  }

  return {
    isWatchBackUrl,
    isWxMiniProgram,
    meetingMode,
    iframeMode,
    pageError,
    watchAppInited,
    shouldShowSplash,
    liveWatchInited,

    resetUpWatchCore,
    setupLiveWatch,
    setPageError,

    pauseConnectLiveWatch,
    recoverConnectLiveWatch,
  };
});
