import { computed, unref } from 'vue';

import { useChannelStore } from '@/store/use-channel-store';

import { translate } from '@/assets/lang';
import { isMobile, isWeixin } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { LiveStatus, PayProvider } from '@polyv/live-watch-sdk';

import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import type { ProductGoodData } from '../types/product-types';

/**
 * @hook 互动-商品库
 * */
export const useProduct = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const { getWatchCore, getEmitter } = useGlobalInject();

  const { toast } = useToastManager();

  const watchCore = getWatchCore();
  /** 商品库 SDK 实例 */
  const productSdk = watchCore.interactReceive.getProduct();

  /** 热卖词数据  */
  const productHotEffectTips = computed(() => {
    return interactReceiveStore.interactSetting.productHotEffectTips;
  });

  /** 热卖特效开关 */
  const productHotEffectEnabled = computed(() => {
    return interactReceiveStore.interactSetting.productHotEffectEnabled;
  });

  /** 招聘岗位开关 */
  const recruitmentEnabled = computed(() => {
    return interactReceiveStore.interactSetting.recruitmentEnabled;
  });

  /** 是否显示订单 */
  const showQrCodeShareDialog = computed(() => {
    const supportPayProvider = interactReceiveStore.supportPayProvider;
    const enabledAliPay = supportPayProvider.includes(PayProvider.Alipay);

    return !isMobile || (!isWeixin && !enabledAliPay);
  });

  /** 招聘标签文本 */
  const jobDescLabel = computed(() => {
    if (!unref(recruitmentEnabled)) {
      return '';
    }
    return translate('interact.product.jobDetail');
  });

  /**
   * @description: 检测是否允许购买
   * @return {boolean}
   */
  const checkIfAllowBuy = () => {
    return watchCore.order.checkPurchasable();
  };

  /**
   * @description: 微信购买
   * @param product 商品详情
   * @return
   */
  const onWechatBuy = (product: ProductGoodData) => {
    // 不支持购买
    if (!checkIfAllowBuy()) {
      toast.error(translate('order.nonSupportBuy'));
      return;
    }

    // Pc引导到H5微信
    if (showQrCodeShareDialog.value) {
      getEmitter().emit(appEvents.global.OpenQrCodeShareDialog);
      return;
    }

    getEmitter().emit(appEvents.interaction.OpenOrderPopup, [product]);
  };

  const onChange = (visible: boolean) => {
    interactReceiveStore.productBubbleVisible = visible;
  };

  return {
    productSdk,
    recruitmentEnabled,
    jobDescLabel,
    productHotEffectTips,
    productHotEffectEnabled,
    onWechatBuy,
    onChange,
    showQrCodeShareDialog,
  };
};

/** 商品库数据上报 hook */
export const useProductTrack = () => {
  const channelStore = useChannelStore();
  const interactReceiveStore = useInteractReceiveStore();

  const { getWatchCore } = useGlobalInject();

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
