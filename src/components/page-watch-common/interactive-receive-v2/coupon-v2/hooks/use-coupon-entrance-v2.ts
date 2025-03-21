import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useCoupon } from './use-coupon';

export const useCouponCommonPendantV2 = () => {
  const { targetInited, getIarTarget } = useCoupon();

  const { getEmitter } = useGlobalInject();
  const { couponPendantVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  function showCouponCommonList() {
    getEmitter().emit(appEvents.interaction.OpenCouponCommonList, true);
  }

  return {
    targetInited,
    getIarTarget,
    couponPendantVisible,
    showCouponCommonList,
  };
};
