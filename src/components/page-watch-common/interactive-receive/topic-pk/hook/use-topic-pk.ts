import { getWatchCore } from '@/core/watch-sdk';

export const useTopicPk = () => {
  const watchCore = getWatchCore();

  const topicPkSdk = watchCore.interactReceive.getTopicPK();

  return {
    topicPkSdk,
  };
};
