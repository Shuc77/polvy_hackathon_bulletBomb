import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { getWatchCore, getSocket } from '@/core/watch-sdk';
import { UserEvents } from '@polyv/live-watch-sdk';
import type { WebViewBridge } from '@polyv/web-view-bridge';
import { isWebView } from '@polyv/web-view-bridge/is-webview';
import { debounce } from 'lodash-es';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref, watch } from 'vue';
import { useInteractReceiveStore } from './use-interact-receive-store';
import { useLayoutStore } from './use-layout-store';
import { usePlayerStore } from './use-player-store';
import { useWatchAppStore } from './use-watch-app-store';

/**
 * 原生 Webview-Feed 的逻辑是
 * 1、进入页面后，主动触发页面锁定处理 【原生端默认不锁定】
 * 2、监听可滚动的元素，如果滚动到一定程度再通知原生解锁页面滚动
 * 3、页面解锁滚动有前提条件，比如当前不能处于全屏状态
 */

export interface WebviewStoreState {
  /** 是否基于保利威 webview 协议嵌入的观看页 */
  isPlvWebview: Ref<boolean>;
  /** 是否 webview 内嵌小窗状态 */
  isSmallWindow: Ref<boolean>;
  /** 当前 Webview 页面是否激活 */
  curWebviewPageIsActive: Ref<boolean>;
  /** 在 webview 中小窗化时，打开的小窗宽高 */
  plvWebviewDataSize: ComputedRef<{ width: number; height: number }>;
  /** 当前 webview 页面禁止拖拽 */
  webviewPageDragDisabled: ComputedRef<boolean>;
}

export interface WebviewStoreActions {
  /** 初始化桥接器 */
  initWebviewBridge(): Promise<void>;
  /** 获取桥接器对象 */
  getPlvWebviewBridge(): WebViewBridge | undefined;
  /** 发送用户信息 */
  sendUserInfo(): void;
  /** 恢复到正常窗口 */
  toNormalWindow(): void;
  /** 关闭当前 webview 页面 */
  closeWindow(): void;
  /** 锁定当前 webview 页面 */
  toLockDrag(trackKey: string): void;
  /** 解锁当前 webview 页面 */
  toUnlockDrag(): void;
  /** 移动到上一个 webview Feed 页面 */
  toNextWebview(): void;
  /** 移动到下一个 webview Feed 页面 */
  toPrevWebview(): void;
}

export interface WebviewStore extends WebviewStoreState, WebviewStoreActions {}

export const useWebviewStore = defineStore<'webview', WebviewStore>('webview', () => {
  const { forcePausePlay, toPlay, toFreezePlay } = usePlayerAction();

  const watchAppStore = useWatchAppStore();
  const playerStore = usePlayerStore();
  const layoutStore = useLayoutStore();
  const interactReceiveStore = useInteractReceiveStore();

  /** webview 桥接器 */
  let webviewBridge: WebViewBridge | undefined;

  /** 是否基于保利威 webview 协议嵌入的观看页 */
  const isPlvWebview = ref(isWebView());

  /** 是否 webview 内嵌小窗状态 */
  const isSmallWindow = ref(false);
  // const isSmallWindow = ref(true);

  const curWebviewPageIsActive = ref(true);

  const curWebviewPageIsLockDrag = ref(false);

  // 用来记录锁住拖拽的队列
  const webviewLockDragQueue: string[] = [];

  const webviewPageDragDisabled = computed(() => {
    return (
      layoutStore.mobilePlayerIsPageFullscreen ||
      layoutStore.mobileDocIsPageFullscreen ||
      interactReceiveStore.isGoOnRedpackRain
    );
  });

  watch(
    () => webviewPageDragDisabled.value,
    () => {
      if (!curWebviewPageIsActive.value) {
        return;
      }

      if (webviewPageDragDisabled.value) {
        toLockDrag('webviewPageDragDisabled');
      } else {
        toUnlockDrag();
      }
    },
  );

  /** 在 webview 中小窗化时，打开的小窗宽高 */
  const plvWebviewDataSize = computed(() => ({
    width: playerStore.isPortraitResolutionRate ? 90 : 160,
    height: playerStore.isPortraitResolutionRate ? 160 : 90,
  }));

  const onWebviewIsActive = () => {
    console.warn('[webview-bridge-feed-flow] onWebviewIsActive');
    curWebviewPageIsActive.value = true;

    // toLockDrag();

    if (!watchAppStore.isLiveWatchConnected) {
      console.warn('[webview-bridge-feed-flow] onWebviewIsActive recoverConnectLiveWatch');
      watchAppStore.recoverConnectLiveWatch();
      return;
    }

    toFreezePlay(false);
    toPlay();
    getSocket()?.connect();
  };

  const onWebviewIsInactive = () => {
    console.warn('[webview-bridge-feed-flow] onWebviewIsInactive');
    curWebviewPageIsActive.value = false;

    // toLockDrag();

    // 注意，页面初始化时在这里写的方法基本是无效的，只能到对应回调的地方去处理，此处只是页面初始化完成后的一般性逻辑处理
    forcePausePlay({ onceHiddenPlayButton: true });
    getSocket()?.disconnect();
  };

  /** 初始化桥接器 */
  async function initWebviewBridge() {
    if (webviewBridge || !isPlvWebview.value) {
      return;
    }

    try {
      const { WebViewBridge } = await import(
        /* webpackChunkName: "web-view-bridge" */ '@polyv/web-view-bridge'
      );
      webviewBridge = new WebViewBridge();
      await webviewBridge.connectWebViewBridge();
      console.warn('[webview-bridge-feed-flow] connect');

      __listenEvents();
    } catch (e) {
      console.warn('initWebviewBridge', e);
    }
  }

  /**
   * 监听事件
   */
  function __listenEvents() {
    // 监听 watchCore 事件
    __listenWatchCoreEvents();
    // 监听桥接器事件
    __listenBridgeEvents();
    // 监听 window 事件
    __listenWindowEvents();
  }

  function __listenWatchCoreEvents() {
    const watchCore = getWatchCore();
    // 踢出当前用户时恢复正常窗口
    watchCore.user.eventEmitter.on(UserEvents.CurrentUserKicked, () => {
      if (unref(isSmallWindow)) {
        toNormalWindow();
      }
    });
  }

  function __listenBridgeEvents() {
    if (!webviewBridge) {
      return;
    }
    // webview 被小窗化
    webviewBridge.on('changeToSmall', (event?: { isPIP: boolean }) => {
      isSmallWindow.value = true;

      // iOS 系统级小窗情况，暂停 web 播放，交由 iOS 原生播放
      if (event?.isPIP) {
        forcePausePlay();
      }
    });

    // webview 取消小窗化
    webviewBridge.on('changeToNormal', (event?: { isPIP: boolean }) => {
      isSmallWindow.value = false;

      // iOS 系统级小窗情况，恢复 web 播放
      if (event?.isPIP) {
        toPlay();
      }
    });

    webviewBridge.on('callWebViewEvent', ({ event }: { event?: string }) => {
      console.warn(`[webview-bridge][callWebViewEvent] ${event || 'unknown'}`);
      if (event === 'isActive') {
        onWebviewIsActive();
        return;
      }

      if (event === 'isInactive') {
        onWebviewIsInactive();
      }
    });
  }

  function __listenWindowEvents() {
    // 小窗发生跳转时恢复正常窗口
    window.addEventListener('beforeunload', () => {
      return new Promise<void>(resolve => {
        if (!unref(isSmallWindow)) {
          resolve();
          return;
        }

        toNormalWindow();
        setTimeout(() => {
          resolve();
        }, 200);
      });
    });
  }

  /**
   * 传参给 webview。主要是 iOS 系统级小窗需要下列信息
   */
  function sendUserInfo() {
    if (!webviewBridge) {
      return;
    }
    const watchCore = getWatchCore();
    const accountId = watchCore.getAccountId();
    const channelId = watchCore.channel.getChannelId();
    const userId = watchCore.user.requiredUserId();
    const nickname = watchCore.user.requiredUserNick();
    const params = watchCore.user.getStatisticsParams();

    webviewBridge.sendData('getLiveUserInfo', {
      userId: accountId,
      channelId,
      customParam: {
        liveParam1: userId,
        liveParam2: nickname,
        liveParam3: '',
        liveParam4: params.param4,
        liveParam5: params.param5,
      },
    });
  }

  /** 获取桥接器对象 */
  function getPlvWebviewBridge() {
    return webviewBridge;
  }

  /** 恢复到正常窗口 */
  function toNormalWindow() {
    // 当前非小窗中
    if (!unref(isSmallWindow)) {
      return;
    }

    webviewBridge?.sendData('changeToNormal', {});
  }

  /** 关闭当前 webview 页面 */
  function closeWindow() {
    webviewBridge?.sendData('closeWindow', {});
  }

  /** 锁定当前 webview Feed 页面 */
  function toLockDrag(trackKey: string) {
    if (!isPlvWebview.value) return;

    if (!curWebviewPageIsActive.value) {
      // console.warn('[webview-bridge-feed-flow] try to toLockDrag but not activeWebview', trackKey);
      return;
    }

    webviewLockDragQueue.push(trackKey);
    // console.warn('[webview-bridge-feed-flow][callAppEvent] toLockDrag', trackKey);
    curWebviewPageIsLockDrag.value = true;
    webviewBridge?.sendData('callAppEvent', { event: 'toLockDrag' });
  }

  /** 解锁当前 webview Feed 页面 */
  function toUnlockDrag() {
    if (!isPlvWebview.value) return;

    if (!curWebviewPageIsActive.value) {
      // console.warn('[webview-bridge-feed-flow] try to toUnlockDrag but not activeWebview');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const popItem = webviewLockDragQueue.pop();
    // console.warn('pop webviewLockDragQueue', popItem);
    // console.warn('webviewLockDragQueue', webviewLockDragQueue);
    if (webviewPageDragDisabled.value || webviewLockDragQueue.length > 0) {
      return;
    }

    // console.warn('[webview-bridge-feed-flow][callAppEvent]  toUnlockDrag');
    curWebviewPageIsLockDrag.value = false;
    webviewBridge?.sendData('callAppEvent', { event: 'toUnlockDrag' });
  }

  /** 移动到下一个 webview Feed 页面 */
  const toNextWebview = debounce(() => {
    if (webviewPageDragDisabled.value) {
      return;
    }

    console.warn('[webview-bridge-feed-flow][callAppEvent]  toNextWebview');
    curWebviewPageIsLockDrag.value = false;
    webviewBridge?.sendData('callAppEvent', { event: 'toNextWebview' });
  }, 300);

  /** 移动到上一个 webview Feed 页面 */
  const toPrevWebview = debounce(() => {
    if (webviewPageDragDisabled.value) {
      return;
    }

    console.warn('[webview-bridge-feed-flow][callAppEvent]  toPrevWebview');
    webviewBridge?.sendData('callAppEvent', { event: 'toPrevWebview' });
  }, 300);

  return {
    isPlvWebview,
    isSmallWindow,
    curWebviewPageIsActive,
    plvWebviewDataSize,
    webviewPageDragDisabled,
    initWebviewBridge,
    getPlvWebviewBridge,
    sendUserInfo,
    toNormalWindow,
    closeWindow,
    toLockDrag,
    toUnlockDrag,
    toNextWebview,
    toPrevWebview,
  };
});
