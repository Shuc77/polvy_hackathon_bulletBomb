import { useGlobalInject } from '@/app/use-global-inject';
import { useLangStore } from '@/store/use-lang-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useThemeStore } from '@/store/use-theme-store';
import { PwcEventEmitter, useConfigProvider } from '@polyv/vue-components';

export const installVueComponents = () => {
  const langStore = useLangStore();
  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();
  const { getEmitter } = useGlobalInject();

  useConfigProvider({
    globalLang: () => langStore.currentLang,
    pageFullscreen: () => layoutStore.mobilePlayerIsPageFullscreen,
    getEmitter: getEmitter as unknown as () => PwcEventEmitter,
    getSkinColorConfig: () => {
      return {
        skinColorMode: themeStore.pageSkinColorMode,
        specialColor: themeStore.pageSkinConfig.specialColor,
      };
    },
  });
};
