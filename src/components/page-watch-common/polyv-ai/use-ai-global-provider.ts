import { provide, reactive, watchEffect } from 'vue';

import { isMobile } from '@/assets/utils/browser';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useGlobalInject } from '@/app/use-global-inject';
import { useThemeStore } from '@/store/use-theme-store';
import { storeToRefs } from 'pinia';
import { ChannelWatchPageSkin } from '@polyv/live-watch-sdk';

export const useAIGlobalProvider = () => {
  const { currentLang } = storeDefinitionToRefs(useLangStore);

  const { getWatchCore } = useGlobalInject();

  const { pageSkin } = storeToRefs(useThemeStore());

  const watchCore = getWatchCore();

  const watchAICore = watchCore.polyvAI.getWatchAICore();

  function getWatchAICore() {
    return watchAICore;
  }

  // 这里只讲白色皮肤和黑色皮肤改用内部主题，其他皮肤不传递主题，由观看页自行覆盖样式
  // 注意，只有初始化时生效
  function getTheme() {
    if (pageSkin.value === ChannelWatchPageSkin.White) {
      return 'light';
    }

    if (pageSkin.value === ChannelWatchPageSkin.Black) {
      return 'dark';
    }

    return '';
  }

  const provideData = reactive({
    globalLang: currentLang.value,
    theme: getTheme(),
    isMobile: () => isMobile,
    getWatchAICore,
  });

  watchEffect(() => {
    provideData.globalLang = currentLang.value;
    provideData.theme = getTheme();
  });

  provide('AIUIGlobalConfig', provideData);

  return {
    watchCore,
    watchAICore,
  };
};
