import { getWatchCore } from '@/core/watch-sdk';
import { UserEvents } from '@polyv/live-watch-sdk';
import { useViewerStore } from '@/store/use-viewer-store';

export function bindUserEvents() {
  const viewerStore = useViewerStore();
  const watchCore = getWatchCore();

  watchCore.user.eventEmitter.on(UserEvents.UserInfoChange, viewerStore.syncViewerInfo);
}
