import { getWatchCore } from '@/core/watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

export const useRushAnswer = () => {
  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  const rushAnswerSdk = watchCore.interactReceive.getRushAnswer();

  function handleEntryVisibleChanged(visible: boolean) {
    interactReceiveStore.$patch({
      rushAnswerPendantVisible: visible,
    });
  }

  return {
    rushAnswerSdk,
    handleEntryVisibleChanged,
  };
};
