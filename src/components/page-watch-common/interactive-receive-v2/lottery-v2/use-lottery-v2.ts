import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvIarLottery } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';
import type { LotteryConfig } from '@polyv/iar-lottery-ui';

export const useLotteryTarget = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvIarLottery>(() => {
    return watchCore.interactReceive.getLotteryV2();
  });

  const privacyDetail = watchCore.interactReceive.getLotteryPrivacyDetail();
  const lotteryConfig: LotteryConfig = {
    privateContent: privacyDetail.privacyContent,
  };

  return {
    targetInited,
    getIarTarget,
    lotteryConfig,
  };
};
