import { getWatchCore } from '@/core/watch-sdk';
import { UserEvents } from '@polyv/live-watch-sdk';
import type { WebViewBridge } from '@polyv/web-view-bridge';
import { isWebView } from '@polyv/web-view-bridge/is-webview';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { usePlayerStore } from './use-player-store';

export interface WebviewStoreState {
  /** 是否基于保利威 webview 协议嵌入的观看页 */
  isPlvWebview: Ref<boolean>;
  /** 是否 webview 内嵌小窗状态 */
  isSmallWindow: Ref<boolean>;
  /** 在 webview 中小窗化时，打开的小窗宽高 */
  plvWebviewDataSize: ComputedRef<{ width: number; height: number }>;
}

export interface WebviewStoreActions {
  /** 初始化桥接器 */
  initWebviewBridge(): Promise<void>;
  /** 获取桥接器对象 */
  getPlvWebviewBridge(): WebViewBridge | undefined;
  /** 恢复到正常窗口 */
  toNormalWindow(): void;
  /** 关闭当前 webview 页面 */
  closeWindow(): void;
}

export interface WebviewStore extends WebviewStoreState, WebviewStoreActions {}

export const useWebviewStore = defineStore<'webview', WebviewStore>('webview', () => {
  const playerStore = usePlayerStore();

  /** webview 桥接器 */
  let webviewBridge: WebViewBridge | undefined;

  /** 是否基于保利威 webview 协议嵌入的观看页 */
  const isPlvWebview = ref(isWebView());
  // const isPlvWebview = ref(true);

  /** 是否 webview 内嵌小窗状态 */
  const isSmallWindow = ref(false);
  // const isSmallWindow = ref(true);

  /** 在 webview 中小窗化时，打开的小窗宽高 */
  const plvWebviewDataSize = computed(() => ({
    width: playerStore.isPortraitResolutionRate ? 90 : 160,
    height: playerStore.isPortraitResolutionRate ? 160 : 90,
  }));

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

      __listenEvents();
      __sendInitInfo();
    } catch (e) {
      console.warn(e);
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
        const watchCore = getWatchCore();
        watchCore.player.pause();
      }
    });

    // webview 取消小窗化
    webviewBridge.on('changeToNormal', (event?: { isPIP: boolean }) => {
      isSmallWindow.value = false;

      // iOS 系统级小窗情况，恢复 web 播放
      if (event?.isPIP) {
        const watchCore = getWatchCore();
        watchCore.player.play();
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
  function __sendInitInfo() {
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

  return {
    isPlvWebview,
    isSmallWindow,
    plvWebviewDataSize,
    initWebviewBridge,
    getPlvWebviewBridge,
    toNormalWindow,
    closeWindow,
  };
});
