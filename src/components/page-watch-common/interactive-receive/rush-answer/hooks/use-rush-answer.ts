import { getWatchCore } from '@/core/watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useWebviewStore } from '@/store/use-webview-store';

export const useRushAnswer = () => {
  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();
  const webviewStore = useWebviewStore();

  const rushAnswerSdk = watchCore.interactReceive.getRushAnswer();

  function handleEntryVisibleChanged(visible: boolean) {
    interactReceiveStore.$patch({
      rushAnswerPendantVisible: visible,
    });
  }

  function onRushAnswerVisibleChanged(visible: boolean) {
    if (visible) {
      webviewStore.toLockDrag('rush-answer');
    } else {
      webviewStore.toUnlockDrag();
    }
  }

  return {
    rushAnswerSdk,
    handleEntryVisibleChanged,
    onRushAnswerVisibleChanged,
  };
};
