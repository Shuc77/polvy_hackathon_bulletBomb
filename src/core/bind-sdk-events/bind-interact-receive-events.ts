import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { InteractReceiveEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export function bindInteractReceiveEvents() {
  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  // 互动设置信息更新事件
  watchCore.interactReceive.eventEmitter.on(InteractReceiveEvents.InteractSettingUpdate, () => {
    interactReceiveStore.syncInteractStore();
  });
}
