import { watch, onBeforeMount, onMounted } from 'vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { useWeixinConfig } from '@/hooks/platform/use-weixin/use-weixin-config';

import { usePageStore } from '@/store/use-page-store';
import { useAuthStore } from '@/store/use-auth-store';

import { removeQueryParam } from '@/hooks/core/use-query-params';
import { AuthSpecialQueryParams } from '@/components/page-splash-common/auth/hooks/use-auth-special';

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

export const useMainEnter = (
  options: {
    watchLoader?: () => Promise<unknown>;
  } = {},
) => {
  const { watchLoader } = options;

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
    if (!authStore.isAuthorized) return;

    removeQueryParam(['name', 'password', ...AuthSpecialQueryParams]);
  }

  usePageSizeSetup();

  onBeforeMount(() => {
    // eslint-disable-next-line promise/prefer-await-to-then
    useWeixinConfig().finally(() => {
      removeUrlAuthQueryParams();
    });
  });
};
