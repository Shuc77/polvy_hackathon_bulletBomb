import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

export const useTopicPk = () => {
  const { getWatchCore } = useGlobalInject();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();

  const topicPkSdk = watchCore.interactReceive.getTopicPK();

  function onTopicPKVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('topic-pk');
    } else {
      toUnlockFeedDrag();
    }
  }

  return {
    topicPkSdk,
    onTopicPKVisibleChanged,
  };
};
