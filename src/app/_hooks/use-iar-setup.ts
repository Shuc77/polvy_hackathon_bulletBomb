import { getWatchCore } from '@/core/watch-sdk';
import { loadIarUI } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { toast } from '@/hooks/components/use-toast';

/**
 * @hook 互动功能安装 hook
 */
export const useIarSetup = () => {
  /** 加载互动功能 SDK */
  async function loadIarSDK() {
    try {
      const watchCore = getWatchCore();

      await Promise.all([
        watchCore.interactReceive.setupIarCore(), // 安装互动功能逻辑层
        loadIarUI(), // 加载互动功能 UI 组件
      ]);
    } catch (error) {
      console.error(error);
      toast.error('数据请求异常，加载互动功能失败！');
    }
  }

  return {
    loadIarSDK,
  };
};
