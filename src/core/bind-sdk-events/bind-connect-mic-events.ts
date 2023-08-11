import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

export function bindConnectMicModuleEvents(): void {
  const watchCore = getWatchCore();
  const connectMicStore = useConnectMicStore();

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicInfoChange, () => {
    connectMicStore.syncConnectMicInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ScreenShareInfoChange, () => {
    connectMicStore.syncScreenShareInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.NetworkInfoChange, () => {
    connectMicStore.syncNetworkInfo();
  });

  watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicListChange, () => {
    connectMicStore.syncConnectMicList();
  });
}
