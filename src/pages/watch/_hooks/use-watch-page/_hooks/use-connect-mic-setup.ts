import { onMounted } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';

import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useEventBusListener, appEvents } from '@/app/app-events';

/**
 * 连麦 hook
 */
export const useConnectMicSetup = () => {
  const connectMicStore = useConnectMicStore();

  /**
   * 初始化连麦
   */
  async function initConnectCall() {
    if (!connectMicStore.connectMicEnabled) return;

    const watchCore = getWatchCore();
    await watchCore.connectMic.setupConnectMic();
  }

  onMounted(() => {
    initConnectCall();
  });

  useEventBusListener(appEvents.connectMic.ResetUpConnectMic, () => {
    initConnectCall();
  });
};
