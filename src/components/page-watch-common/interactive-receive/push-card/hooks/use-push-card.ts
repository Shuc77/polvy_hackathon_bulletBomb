import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';

/** 卡片推送 hook */
export const usePushCard = () => {
  const { getWatchCore } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();
  /** 卡片推送 SDK 实例 */
  const pushCardSdk = watchCore.interactReceive.getPushCard();

  /** 处理卡片推送入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.pushCardPendantVisible = visible;
  };

  function onPushCardVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('push-card');
    } else {
      toUnlockFeedDrag();
    }
  }

  return {
    pushCardSdk,
    onEntryVisibleChanged,
    onPushCardVisibleChanged,
  };
};

export const usePushCardLinkParams = () => {
  const { getWatchCore } = useGlobalInject();

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
