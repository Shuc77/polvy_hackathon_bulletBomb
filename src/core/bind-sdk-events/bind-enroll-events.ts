import { useEnrollStore } from '@/store/use-enroll-store';
import { EnrollEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

export function bindEnrollModuleEvents(): void {
  const watchCore = getWatchCore();
  const enrollStore = useEnrollStore();

  watchCore.enroll.eventEmitter.on(EnrollEvents.EnrollStoreInfoChanged, () => {
    enrollStore.syncEnrollInfo();
  });
}
