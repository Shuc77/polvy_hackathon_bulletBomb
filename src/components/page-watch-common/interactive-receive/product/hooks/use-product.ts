import { getWatchCore } from '@/core/watch-sdk';
import { computed, unref } from 'vue';

import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { LiveStatus } from '@polyv/live-watch-sdk';

/**
 * @hook 互动-商品库
 * */
export const useProduct = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  /** 商品库 SDK 实例 */
  const productSdk = watchCore.interactReceive.getProduct();

  /** 招聘岗位开关 */
  const recruitmentEnabled = computed(() => {
    return interactReceiveStore.interactSetting.recruitmentEnabled;
  });

  /** 招聘标签文本 */
  const jobDescLabel = computed(() => {
    if (!unref(recruitmentEnabled)) {
      return '';
    }
    return translate('interact.product.jobDetail');
  });

  return {
    productSdk,
    recruitmentEnabled,
    jobDescLabel,
  };
};

/** 商品库跳转参数 hook */
export const useProductLinkParams = () => {
  const watchCore = getWatchCore();
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();
  const inviteStore = useInviteStore();

  /** 获取链接参数 */
  const getLinkParams = () => {
    const saleInfo = watchCore.user.getUserSaleInfo();
    return {
      openId: viewerStore.openId,
      unionId: viewerStore.unionId,
      userId: viewerStore.viewerId,
      nickname: viewerStore.nickname,
      // 邀请人 openId
      inviteOpenId: inviteStore.inviteUserOpenId,
      // 邀请人 unionId
      inviteUnionId: inviteStore.inviteUserUnionId,
      // 渠道 id
      promoteId: channelStore.promoteId,
      // 频道号
      channelId: channelStore.channelId,
      // 当前场次号
      sessionId: channelStore.currentSessionId,
      // 跟进人 id
      saleId: saleInfo.saleId,
    };
  };

  return {
    getLinkParams,
  };
};

/** 商品库数据上报 hook */
export const useProductTrack = () => {
  const channelStore = useChannelStore();
  const interactReceiveStore = useInteractReceiveStore();

  /** 上报打开商品列表数据 */
  const trackOpenProductList = () => {
    if (
      channelStore.liveStatus !== LiveStatus.Live ||
      !interactReceiveStore.interactSetting.productTrackEnabled
    ) {
      return;
    }

    const watchCore = getWatchCore();
    watchCore.rtas.trackBehaviorEvent({
      eventType: 'click',
      eventId: 'product_cart_click',
      data: {
        shoppingBagId: 'shopping_bag_universal_id',
        linkType: isMobile ? 'mobile' : 'pc',
      },
    });
  };

  return {
    trackOpenProductList,
  };
};
