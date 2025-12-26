import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

export const useTopicPk = () => {
  const { getWatchCore } = useGlobalInject();

  const { toInterruptUserClick } = useInterruptUserClick();

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

  async function beforeChooseTopicPkAnswer() {
    return toInterruptUserClick({
      triggerSource: 'before-choose-topic-pk-answer',
      ignoreSetNick: true,
    });
  }

  return {
    topicPkSdk,
    onTopicPKVisibleChanged,
    beforeChooseTopicPkAnswer,
  };
};
