import { watch, onBeforeMount, onMounted } from 'vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { useWeixinConfig } from '@/hooks/platform/use-weixin/use-weixin-config';
import { usePageStore } from '@/store/use-page-store';

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

  usePageSizeSetup();

  onBeforeMount(() => {
    useWeixinConfig();
  });
};
