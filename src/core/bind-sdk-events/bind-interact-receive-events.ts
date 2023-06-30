import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { InteractReceiveEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export function bindInteractReceiveEvents() {
  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  /**
   * 商品库开关
   */
  watchCore.interactReceive.eventEmitter.on(InteractReceiveEvents.ProductEnabledChange, () => {
    interactReceiveStore.syncInteractStore();
  });
}
