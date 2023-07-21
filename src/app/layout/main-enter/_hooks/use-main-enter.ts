import { watch, onBeforeMount } from 'vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinConfig } from '@/app/_hooks/use-weixin-setup';

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

  onBeforeMount(() => {
    useWeixinConfig();
  });
};
