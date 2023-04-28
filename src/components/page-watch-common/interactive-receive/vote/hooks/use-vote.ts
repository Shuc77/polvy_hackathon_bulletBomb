import { getWatchCore } from '@/core/watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

/** 投票 hook */
export const useVote = () => {
  const watchCore = getWatchCore();

  /** 投票 SDK 实例 */
  const voteSdk = watchCore.interactReceive.getVote();

  /** 当前用户已投票的列表 */
  const { votedList } = storeDefinitionToRefs(useInteractReceiveStore);

  return {
    voteSdk,
    votedList,
  };
};
