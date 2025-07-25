import { watch, onBeforeMount, onMounted, nextTick } from 'vue';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

import { usePageStore } from '@/store/use-page-store';
import { useAuthStore } from '@/store/use-auth-store';

import { useQueryParams } from '@/hooks/core/use-query-params';
import { AuthSpecialQueryParams } from '@/components/page-splash-common/auth/hooks/use-auth-special';
import { useIarSetup } from '@/app/layout/main-enter/_hooks/use-iar-setup';
import { useConnectMicSetup } from '@/app/layout/main-enter/_hooks/use-connect-mic-setup';
import { useWeixinShareConfigUpdate } from '@/hooks/platform/use-weixin/use-weixin-config';
import { useWebviewStore } from '@/store/use-webview-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useEmotionSetup } from './use-emotion-setup';
import { tabletLoadDesktopTemplate } from '@/assets/utils/browser';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { useShareStore } from '@/store/use-share-store';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';

/**
 * 页面尺寸初始化设置
 */
const usePageSizeSetup = () => {
  const pageStore = usePageStore();
  const { isSmallWindow } = storeDefinitionToRefs(useWebviewStore);

  function savePageSize() {
    pageStore.resetUpPageSize();
    document.documentElement.style.setProperty(
      '--plv-watch-full-screen-vw',
      `${pageStore.pageClientWidth}px`,
    );
    document.documentElement.style.setProperty(
      '--plv-watch-full-screen-vh',
      `${pageStore.pageClientHeight}px`,
    );
  }

  watch(isSmallWindow, () => {
    setTimeout(() => {
      savePageSize();
    }, 300);
  });

  onMounted(() => {
    savePageSize();
  });

  useWindowResizeListener(() => {
    savePageSize();
  }, true);

  if (tabletLoadDesktopTemplate) {
    useScreenOrientHook({
      autoListenCb: () => {
        setTimeout(() => {
          savePageSize();
        }, 0);
      },
    });
  }
};

export const mainEnterEmits = () => ({
  /**
   * 页面挂载
   * @warn 由于 main 组件只是一个容器，在真正的页面组件挂载前可能就会触发 mounted 了，所以 main 组件改用这个事件来等效 mounted
   * */
  'page-mounted': emitFunc<void>(),
});

export const useMainEnter = (options: {
  emit: VueEmit<typeof mainEnterEmits>;
  watchLoader?: () => Promise<unknown>;
}) => {
  const { emit, watchLoader } = options;
  const { removeQueryParam } = useQueryParams();

  const { loadIarSDK } = useIarSetup();

  const { setupEmotionParser } = useEmotionSetup();

  const { setupConnectMic } = useConnectMicSetup();

  const { updateWeixinShareConfig } = useWeixinShareConfigUpdate();

  const watchAppStore = useWatchAppStore();
  const authStore = useAuthStore();
  const shareStore = useShareStore();
  const inviteStore = useInviteStore();
  const playbackStore = usePlaybackStore();

  const webviewStore = useWebviewStore();

  watch(
    () => watchAppStore.shouldShowSplash,
    async newVal => {
      if (watchAppStore.shouldShowForceAuth) {
        return;
      }

      if (newVal === false) {
        if (watchLoader) {
          await watchLoader();
        }
        // 从引导页进入观看页
        await watchAppStore.setupLiveWatch();
      }
    },
    {
      immediate: true,
    },
  );

  /** 移除 url 上的授权参数 */
  function removeUrlAuthQueryParams() {
    if (!authStore.isAuthorized) return;

    removeQueryParam(['name', 'password', ...AuthSpecialQueryParams]);
  }

  usePageSizeSetup();

  onBeforeMount(() => {
    removeQueryParam(['snapshotPage']);

    // 设置表情解析器
    setupEmotionParser();
  });

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      if (playbackStore.currentPlaybackTarget) {
        nextTick(() => {
          playbackStore.appendPlaybackQueueParams();
        });
      }
    },
  );

  // 在 onMounted 之后触发
  async function onPageMounted() {
    console.log('[render] main-enter mounted');
    emit('page-mounted');

    // 处理当前链接的参数拼接
    removeUrlAuthQueryParams();
    shareStore.appendShareQueueParams();
    inviteStore.appendInviteQueueParams();
    playbackStore.appendPlaybackQueueParams();

    // 页面组件 mounted 后需要再更新一遍分享配置，确保数据正确
    updateWeixinShareConfig();

    // 初始化 webview 逻辑
    if (webviewStore.isPlvWebview) {
      await webviewStore.initWebviewBridge();
    }

    // 加载互动功能 SDK
    await loadIarSDK();

    // 处理需要等观看页加载完后的逻辑
    if (watchAppStore.watchPageInited) {
      if (webviewStore.isPlvWebview) {
        // 进入观看页后初始化webview
        webviewStore.initWebview();
      }

      // 连接聊天室
      await watchAppStore.setupWatchCoreConnect();

      // 延迟设置连麦功能
      setTimeout(() => {
        setupConnectMic();
      }, 0);
    }
  }

  return {
    onPageMounted,
  };
};
