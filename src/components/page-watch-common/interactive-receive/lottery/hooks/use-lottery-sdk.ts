import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { IarLotteryStatus } from '@polyv/live-watch-sdk';

export const useLotterySdk = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  /** 抽奖 SDK 实例 */
  const lotterySdk = watchCore.interactReceive.getLottery();

  /**
   * 根据状态打开抽奖
   * @param status 抽奖状态
   */
  function openLotteryByStatus(status: IarLotteryStatus) {
    switch (status) {
      case IarLotteryStatus.running:
        getEmitter().emit(appEvents.interaction.OpenLotteryAnimation, { visible: true });
        getEmitter().emit(appEvents.interaction.OpenLotteryResult, { visible: false });
        break;
      case IarLotteryStatus.over:
        getEmitter().emit(appEvents.interaction.OpenLotteryResult, { visible: true });
        getEmitter().emit(appEvents.interaction.OpenLotteryAnimation, { visible: false });
        break;
      case IarLotteryStatus.end:
        getEmitter().emit(appEvents.interaction.OpenLotteryAnimation, { visible: false });
        break;
    }
  }

  return {
    lotterySdk,
    openLotteryByStatus,
  };
};
