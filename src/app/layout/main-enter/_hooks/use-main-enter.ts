import { watch, onBeforeMount, onMounted } from 'vue';
import { emitFunc, VueEmit } from '@/assets/utils/vue-utils/emit-utils';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

import { usePageStore } from '@/store/use-page-store';
import { useAuthStore } from '@/store/use-auth-store';

import { removeQueryParam } from '@/hooks/core/use-query-params';
import { AuthSpecialQueryParams } from '@/components/page-splash-common/auth/hooks/use-auth-special';
import { useIarSetup } from '@/app/layout/main-enter/_hooks/use-iar-setup';
import { useConnectMicSetup } from '@/app/layout/main-enter/_hooks/use-connect-mic-setup';
import { updateWeixinShareConfig } from '@/hooks/platform/use-weixin/use-weixin-config';

/**
 * 页面尺寸初始化设置
 */
const usePageSizeSetup = () => {
  const pageStore = usePageStore();

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

  onMounted(() => {
    savePageSize();
  });

  useWindowResizeListener(() => {
    savePageSize();
  }, true);
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

  const { loadIarSDK } = useIarSetup();

  const { setupConnectMic } = useConnectMicSetup();

  const watchAppStore = useWatchAppStore();
  const authStore = useAuthStore();

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
    removeQueryParam(['snapshotPage']);

    if (!authStore.isAuthorized) return;

    removeQueryParam(['name', 'password', ...AuthSpecialQueryParams]);
  }

  usePageSizeSetup();

  onBeforeMount(() => {
    removeUrlAuthQueryParams();
  });

  // 在 onMounted 之后触发
  async function onPageMounted() {
    console.log('[render] main-enter mounted');
    emit('page-mounted');

    // 页面组件 mounted 后需要再更新一遍分享配置，确保数据正确
    updateWeixinShareConfig();

    // 加载互动功能 SDK
    await loadIarSDK();

    if (watchAppStore.watchPageInited) {
      await watchAppStore.setupWatchCoreConnect();
      // 可以延迟设置连麦功能
      setTimeout(() => {
        setupConnectMic();
      }, 0);
    }
  }

  return {
    onPageMounted,
  };
};
