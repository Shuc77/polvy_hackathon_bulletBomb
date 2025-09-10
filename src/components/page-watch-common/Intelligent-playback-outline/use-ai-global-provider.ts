import { onBeforeMount, provide, ref } from 'vue';

import { isMobile } from '@/assets/utils/browser';
import { useLangStore } from '@/store/use-lang-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useGlobalInject } from '@/app/use-global-inject';

export const useAIGlobalProvider = () => {
  const { currentLang } = storeDefinitionToRefs(useLangStore);

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const providerLoaded = ref(false);

  function getWatchAICore() {
    return watchCore.polyvAI.getWatchAICore();
  }

  provide('AIUIGlobalConfig', {
    globalLang: currentLang.value,
    isMobile: () => isMobile,
    getWatchAICore,
  });

  onBeforeMount(async () => {
    await watchCore.polyvAI.getWatchAICore();
    providerLoaded.value = true;
  });

  return {
    providerLoaded,
  };
};
