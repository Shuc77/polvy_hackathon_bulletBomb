import { useGlobalInject } from '@/app/use-global-inject';
import { PC_PLAYER_FULL_SCREEN_SELECTOR } from '@/assets/constants/selector';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';
import { PwcEventEmitter, useBrowser, useConfigProvider } from '@polyv/vue-components';

export const installVueComponents = () => {
  const { isMobile } = useBrowser();

  const langStore = useLangStore();
  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();
  const { getEmitter } = useGlobalInject();

  useConfigProvider({
    globalLang: () => langStore.currentLang,
    pageFullscreen: () => layoutStore.mobilePlayerIsPageFullscreen,
    fullscreenElement: isMobile ? undefined : PC_PLAYER_FULL_SCREEN_SELECTOR,
    getEmitter: getEmitter as unknown as () => PwcEventEmitter,
    getSkinColorConfig: () => {
      return {
        skinColorMode: themeStore.pageSkinColorMode,
        specialColor: themeStore.pageSkinConfig.specialColor,
      };
    },
  });
};
