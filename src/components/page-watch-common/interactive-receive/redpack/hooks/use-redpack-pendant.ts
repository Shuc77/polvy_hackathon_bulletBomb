import { getWatchCore } from '@/core/watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

/**
 * @hook 互动-红包挂件
 * */
export const useRedpackPendant = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 处理红包挂件入口显示状态改变 */
  function onEntryVisibleChanged(visible = true) {
    interactReceiveStore.redpackPendantVisible = visible;
  }

  return {
    redpackSdk,
    onEntryVisibleChanged,
  };
};
