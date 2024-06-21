import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWebviewStore } from '@/store/use-webview-store';

/** 卡片推送 hook */
export const usePushCard = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const webviewStore = useWebviewStore();

  const watchCore = getWatchCore();
  /** 卡片推送 SDK 实例 */
  const pushCardSdk = watchCore.interactReceive.getPushCard();

  /** 处理卡片推送入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.pushCardPendantVisible = visible;
  };

  function onPushCardVisibleChanged(visible: boolean) {
    if (visible) {
      webviewStore.toLockDrag('push-card');
    } else {
      webviewStore.toUnlockDrag();
    }
  }

  return {
    pushCardSdk,
    onEntryVisibleChanged,
    onPushCardVisibleChanged,
  };
};

export const usePushCardLinkParams = () => {
  const watchCore = getWatchCore();
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();

  /** 获取链接参数 */
  const getLinkParams = () => {
    const saleInfo = watchCore.user.getUserSaleInfo();
    return {
      userId: viewerStore.viewerId,
      // 频道号
      channelId: channelStore.channelId,
      // 跟进人 id
      saleId: saleInfo.saleId,
    };
  };

  return {
    getLinkParams,
  };
};
