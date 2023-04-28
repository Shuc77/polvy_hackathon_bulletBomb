import { useLangStore } from '@/store/use-lang-store';
import { usePlayerStore } from '@/store/use-player-store';
import { provide, reactive, watchEffect } from 'vue';

/**
 * 互动功能全局配置注入的 key
 */
const INTERACT_GLOBAL_PROVIDE_KEY = 'interactGlobalConfig';

/**
 * @hook 互动功能全局配置
 */
export const useIarGlobalConfigHook = () => {
  const langStore = useLangStore();
  const playerStore = usePlayerStore();

  const provideData = reactive({
    globalLang: langStore.currentLang,
    globalDelayTime: playerStore.delayTime,
  });

  watchEffect(() => {
    provideData.globalLang = langStore.currentLang;
    provideData.globalDelayTime = playerStore.delayTime;
  });

  provide(INTERACT_GLOBAL_PROVIDE_KEY, provideData);
};
