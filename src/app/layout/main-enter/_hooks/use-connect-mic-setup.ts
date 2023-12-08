import { getWatchCore } from '@/core/watch-sdk';

import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useEventBusListener, appEvents } from '@/app/app-events';
import { isIE } from '@/assets/utils/browser';

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
    if (isIE) {
      console.warn('连麦功能不支持在 IE 浏览器中使用！！！');
      return;
    }

    await watchCore.connectMic.setupConnectMic();
  }

  async function setupConnectMic() {
    await initConnectCall();
  }

  useEventBusListener(appEvents.connectMic.ResetUpConnectMic, () => {
    initConnectCall();
  });

  return {
    setupConnectMic,
  };
};
