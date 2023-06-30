import { getWatchCore } from '@/core/watch-sdk';
import { computed, unref } from 'vue';

import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useInviteStore } from '@/store/use-invite-store';
import { LiveStatus, RtasTrackEventId, RtasTrackEventType } from '@polyv/live-watch-sdk';
import { ProductGoodData } from '../types/product-types';

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
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();
  const inviteStore = useInviteStore();

  /** 获取链接参数 */
  const getLinkParams = () => {
    return {
      openId: viewerStore.openId,
      unionId: viewerStore.unionId,
      userId: viewerStore.viewerId,
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

  /**
   * 上报商品信息
   * @param good 商品信息
   * @param eventType
   * @param eventId
   */
  const trackProductItemData = (
    good: ProductGoodData,
    eventType: RtasTrackEventType,
    eventId: RtasTrackEventId,
  ) => {
    if (
      channelStore.liveStatus !== LiveStatus.Live ||
      !interactReceiveStore.interactSetting.productTrackEnabled
    ) {
      return;
    }
    const watchCore = getWatchCore();

    const { name, productId, realPrice, price, productType } = good;
    const data: UniversalParams<string> = {
      name, // 商品名字
      productId, // 商品Id
      price: `${price ?? 0}`, // 价格
      realPrice: `${realPrice}`, // 原价
      productType, // 商品分类
      linkType: isMobile ? 'mobile' : 'pc',
    };
    if (good.logId) {
      data.pushId = good.logId;
    }

    watchCore.rtas.trackBehaviorEvent({
      eventType,
      eventId,
      data,
    });
  };

  /**
   * 上报商品列表中浏览商品数据
   * @param good 商品信息
   */
  const trackProductListItemView = (good: ProductGoodData) => {
    trackProductItemData(good, 'show', 'product_list_item_view');
  };

  /**
   * 上报商品列表中点击商品购买数据
   * @param good 商品信息
   */
  const trackProductListItemClick = (good: ProductGoodData) => {
    trackProductItemData(good, 'click', 'product_push_item_click');
  };

  /**
   * 上报商品推送中浏览商品数据
   * @param good 商品信息
   */
  const trackProductPushItemView = (good: ProductGoodData) => {
    trackProductItemData(good, 'show', 'product_push_item_view');
  };

  /**
   * 上报商品推送中点击商品购买数据
   * @param good 商品信息
   */
  const trackProductPushItemClick = (good: ProductGoodData) => {
    trackProductItemData(good, 'click', 'product_push_item_click');
  };

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
    trackProductItemData,
    trackProductListItemView,
    trackProductListItemClick,
    trackProductPushItemView,
    trackProductPushItemClick,
    trackOpenProductList,
  };
};
