import { getWatchCore } from '@/core/watch-sdk';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

/** 卡片推送 hook */
export const usePushCard = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  /** 卡片推送 SDK 实例 */
  const pushCardSdk = watchCore.interactReceive.getPushCard();

  /** 处理卡片推送入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.pushCardPendantVisible = visible;
  };

  return {
    pushCardSdk,
    onEntryVisibleChanged,
  };
};
