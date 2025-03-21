import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvIarLuckyLottery } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';

export const useLotteryTarget = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvIarLuckyLottery>(() => {
    return watchCore.interactReceive.getLuckyLotteryV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
