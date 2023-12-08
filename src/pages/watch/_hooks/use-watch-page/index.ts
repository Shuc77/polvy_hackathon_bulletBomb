import { LiveStatus } from '@polyv/live-watch-sdk';
import { watch } from 'vue';

import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';

import { useIarGlobalConfigHook } from '@/components/page-watch-common/interactive-receive/use-iar-global-config';

import { useMainScreen } from './_hooks/use-main-screen';
import { usePageViewPolling, usePolyvMeetingPolling } from './_hooks/use-polling';

import { useChannelStore } from '@/store/use-channel-store';
import { useWebviewStore } from '@/store/use-webview-store';

export const useWatchPage = () => {
  // 使用 pv 轮训
  usePageViewPolling();

  // 使用会议模式轮询
  usePolyvMeetingPolling();

  // 设置互动功能全局配置
  useIarGlobalConfigHook();

  // 主副屏响应切换逻辑
  useMainScreen();

  // 初始化 webview 逻辑
  const webviewStore = useWebviewStore();
  if (webviewStore.isPlvWebview) {
    webviewStore.initWebviewBridge();
  }

  // 研讨会"内部研讨"逻辑
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
