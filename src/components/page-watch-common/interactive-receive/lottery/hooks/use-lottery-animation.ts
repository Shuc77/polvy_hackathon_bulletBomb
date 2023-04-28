import { ref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { IarLotteryStatus } from '@polyv/live-watch-sdk';

/**
 * @hook 互动-抽奖-抽奖动画
 * */
export const useLotteryAnimation = () => {
  const watchCore = getWatchCore();
  /** 抽奖 SDK 实例 */
  const lotterySdk = watchCore.interactReceive.getLottery();
  /** 抽奖动画是否显示 */
  const lotteryAnimationVisible = ref(false);
  /** 当前抽奖状态 */
  const currentLotteryStatus = ref<IarLotteryStatus>();

  /** 处理抽奖状态改变 */
  function onLotteryStatusChange(status: IarLotteryStatus) {
    currentLotteryStatus.value = status;

    switch (status) {
      case IarLotteryStatus.running:
        lotteryAnimationVisible.value = true;
        eventBus.$emit(appEvents.interaction.OpenLotteryResult, { visible: false });
        break;
      case IarLotteryStatus.over:
      case IarLotteryStatus.end:
        lotteryAnimationVisible.value = false;
        break;
    }
  }

  /** 处理抽奖动画显示状态改变 */
  function onVisibleChange(visible = false) {
    lotteryAnimationVisible.value = visible;
  }

  return {
    lotterySdk,
    lotteryAnimationVisible,
    onLotteryStatusChange,
    onVisibleChange,
  };
};
