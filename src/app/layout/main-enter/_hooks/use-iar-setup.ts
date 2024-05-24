import { getWatchCore } from '@/core/watch-sdk';
import { loadIarUI } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { toast } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { paramGetter } from '@/hooks/core/use-query-params';
import { YN } from '@polyv/live-watch-sdk';

/**
 * @hook 互动功能安装 hook
 */
export const useIarSetup = () => {
  const interactReceiveStore = useInteractReceiveStore();

  /** 加载互动功能 SDK */
  async function loadIarSDK() {
    if (paramGetter.notNeedIar() === YN.Y) {
      return;
    }

    try {
      const watchCore = getWatchCore();

      await Promise.all([
        watchCore.interactReceive.setupIarCore(), // 安装互动功能逻辑层
        loadIarUI(), // 加载互动功能 UI 组件
      ]);
    } catch (error) {
      console.error(error);
      toast.error(translate('base.error.iarSetup'));
    } finally {
      interactReceiveStore.$patch({
        iarSdkLoaded: true,
      });
    }
  }

  return {
    loadIarSDK,
  };
};
