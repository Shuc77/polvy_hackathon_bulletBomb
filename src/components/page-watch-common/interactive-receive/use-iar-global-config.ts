import { useGlobalInject } from '@/app/use-global-inject';
import { useToastManager } from '@/hooks/components/use-toast';
import { messageBox } from '@/components/common-base/message-box';
import { useLangStore } from '@/store/use-lang-store';
import { usePlaybackStore } from '@/store/use-playback-store';
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
  const playbackStore = usePlaybackStore();

  const { getEmitter } = useGlobalInject();

  const { toast } = useToastManager();

  function getIarDelayTime() {
    return playbackStore.chatReplayEnabled ? 0 : playerStore.delayTime;
  }

  const provideData = reactive({
    globalLang: langStore.currentLang,
    globalDelayTime: getIarDelayTime(),

    toast: (msg: string) => {
      toast.success(msg);
    },
    messageBox: (options: Parameters<typeof messageBox>[0]) => {
      messageBox(options).$confirm();
    },
    getEmitter,
  });

  watchEffect(() => {
    provideData.globalLang = langStore.currentLang;
    provideData.globalDelayTime = getIarDelayTime();
  });

  provide(INTERACT_GLOBAL_PROVIDE_KEY, provideData);
};
