import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { InteractReceiveEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export function bindInteractReceiveEvents() {
  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  /**
   * 投票 id 列表
   */
  watchCore.interactReceive.eventEmitter.on(InteractReceiveEvents.VotedListChange, data => {
    interactReceiveStore.votedList = data.votedList;
  });
}
