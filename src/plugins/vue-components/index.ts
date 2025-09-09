import { useGlobalInject } from '@/app/use-global-inject';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  PwcEventEmitter,
  useBrowser,
  useConfigProvider,
  type ConfigProviderInjectData,
} from '@polyv/vue-components';
import { reactive, watchEffect } from 'vue';

export const installVueComponents = () => {
  const { isMobile } = useBrowser();

  const langStore = useLangStore();
  const layoutStore = useLayoutStore();
  const { getEmitter } = useGlobalInject();

  const configProviderData: ConfigProviderInjectData = reactive({
    globalLang: langStore.currentLang,
    pageFullscreen: layoutStore.mobilePlayerIsPageFullscreen,
    fullscreenElement: isMobile ? undefined : PC_PLAYER_FULL_SCREEN_SELECTOR,
    getEmitter: getEmitter as unknown as () => PwcEventEmitter,
  });

  watchEffect(() => {
    configProviderData.globalLang = langStore.currentLang;
    configProviderData.pageFullscreen = layoutStore.mobilePlayerIsPageFullscreen;
  });

  useConfigProvider(configProviderData);
};
