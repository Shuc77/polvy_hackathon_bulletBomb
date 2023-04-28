import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import type { WebViewBridge } from '@polyv/web-view-bridge';
import { usePlayerStore } from './use-player-store';

export interface WebviewStoreState {
  /** 是否基于保利威 webview 协议嵌入的观看页 */
  isPlvWebview: ComputedRef<boolean>;
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
}

export interface WebviewStore extends WebviewStoreState, WebviewStoreActions {}

export const useWebviewStore = defineStore<'webview', WebviewStore>('webview', () => {
  const playerStore = usePlayerStore();

  /** webview 敲击诶钱 */
  let webviewBridge: WebViewBridge | undefined;

  /** 是否基于保利威 webview 协议嵌入的观看页 */
  const isPlvWebview = computed<boolean>(() => {
    return false;
  });

  /** 是否 webview 内嵌小窗状态 */
  const isSmallWindow = ref(false);

  /** 在 webview 中小窗化时，打开的小窗宽高 */
  const plvWebviewDataSize = computed(() => ({
    width: playerStore.isPortraitResolutionRate ? 90 : 160,
    height: playerStore.isPortraitResolutionRate ? 160 : 90,
  }));

  /** 初始化桥接器 */
  async function initWebviewBridge() {
    if (webviewBridge) {
      return;
    }
    try {
      const { WebViewBridge } = await import(
        /* webpackChunkName: "web-view-bridge" */ '@polyv/web-view-bridge'
      );
      webviewBridge = new WebViewBridge();
      await webviewBridge.connectWebViewBridge();
    } catch (e) {
      console.warn(e);
    }
  }

  /** 获取桥接器对象 */
  function getPlvWebviewBridge() {
    return webviewBridge;
  }

  return {
    isPlvWebview,
    isSmallWindow,
    plvWebviewDataSize,
    initWebviewBridge,
    getPlvWebviewBridge,
  };
});
