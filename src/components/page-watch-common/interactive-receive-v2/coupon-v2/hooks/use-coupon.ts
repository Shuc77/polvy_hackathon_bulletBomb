import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvIarCoupon } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';

export const useCoupon = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvIarCoupon>(() => {
    return watchCore.interactReceive.getCouponV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
