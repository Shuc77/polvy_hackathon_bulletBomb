import { getWatchCore } from '@/core/watch-sdk';
import { useWebviewStore } from '@/store/use-webview-store';

export const useTopicPk = () => {
  const watchCore = getWatchCore();
  const webviewStore = useWebviewStore();

  const topicPkSdk = watchCore.interactReceive.getTopicPK();

  function onTopicPKVisibleChanged(visible: boolean) {
    if (visible) {
      webviewStore.toLockDrag('topic-pk');
    } else {
      webviewStore.toUnlockDrag();
    }
  }

  return {
    topicPkSdk,
    onTopicPKVisibleChanged,
  };
};
