import { watch } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';

import { toast } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';

import { useIarGlobalConfigHook } from '@/components/page-watch-common/interactive-receive/use-iar-global-config';

import { usePageViewPolling } from './_hooks/use-polling';
import { useConnectMicSetup } from './_hooks/use-connect-mic-setup';
import { useMainScreen } from './_hooks/use-main-screen';

import { useWebviewStore } from '@/store/use-webview-store';
import { useChannelStore } from '@/store/use-channel-store';

export const useWatchPage = () => {
  // 使用 pv 轮训
  usePageViewPolling();

  // 使用连麦
  useConnectMicSetup();

  // 设置互动功能全局配置
  useIarGlobalConfigHook();

  // 主副屏响应切换逻辑
  useMainScreen();

  // 初始化 webview 逻辑
  const webviewStore = useWebviewStore();
  if (webviewStore.isPlvWebview) {
    webviewStore.initWebviewBridge();
  }

  const channelStore = useChannelStore();
  watch(
    () => channelStore.liveStatus,
    liveStatus => {
      if (liveStatus !== LiveStatus.Live && channelStore.privateSeminarChannel) {
        toast.info(translate('seminar.hostCloseLive'));
      }
    },
    {
      immediate: true,
    },
  );
};
