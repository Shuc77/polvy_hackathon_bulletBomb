import { useIarGlobalConfigHook } from '@/components/page-watch-common/interactive-receive/use-iar-global-config';

import { usePageViewPolling } from './_hooks/use-polling';
import { useConnectMicSetup } from './_hooks/use-connect-mic-setup';
import { useMainScreen } from './_hooks/use-main-screen';
import { useOnlineHook } from './_hooks/use-online';

export const useWatchPage = () => {
  // 使用 pv 轮训
  usePageViewPolling();

  // 使用连麦
  useConnectMicSetup();

  // 设置互动功能全局配置
  useIarGlobalConfigHook();

  // 主副屏响应切换逻辑
  useMainScreen();

  // 设置在线数据
  useOnlineHook();
};
