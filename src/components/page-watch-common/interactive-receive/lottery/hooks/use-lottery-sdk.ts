import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { IarLotteryStatus } from '@polyv/live-watch-sdk';

export const useLotterySdk = () => {
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
        eventBus.$emit(appEvents.interaction.OpenLotteryAnimation, { visible: true });
        eventBus.$emit(appEvents.interaction.OpenLotteryResult, { visible: false });
        break;
      case IarLotteryStatus.over:
      case IarLotteryStatus.end:
        eventBus.$emit(appEvents.interaction.OpenLotteryAnimation, { visible: false });
        eventBus.$emit(appEvents.interaction.OpenLotteryResult, { visible: true });
        break;
    }
  }

  return {
    lotterySdk,
    openLotteryByStatus,
  };
};
