import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useCoupon } from './use-coupon';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

export const useCouponCommonPendantV2 = () => {
  const { targetInited, getIarTarget } = useCoupon();

  const { getEmitter } = useGlobalInject();
  const { couponPendantVisible } = storeDefinitionToRefs(useInteractReceiveStore);

  const { toInterruptUserClick } = useInterruptUserClick();

  function showCouponCommonList() {
    const res = toInterruptUserClick({
      triggerSource: 'coupon-pendant',
      ignoreSetNick: true,
    });
    if (res) {
      return;
    }

    getEmitter().emit(appEvents.interaction.OpenCouponCommonList, true);
  }

  return {
    targetInited,
    getIarTarget,
    couponPendantVisible,
    showCouponCommonList,
  };
};
