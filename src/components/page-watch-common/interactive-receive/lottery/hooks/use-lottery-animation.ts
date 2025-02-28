import { appEvents, useEventBusListener } from '@/app/app-events';
import { ref } from 'vue';

import { IarLotteryStatus } from '@polyv/live-watch-sdk';
import { useLotterySdk } from './use-lottery-sdk';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

/**
 * @hook 互动-抽奖-抽奖动画
 * */
export const useLotteryAnimation = () => {
  /** 抽奖动画是否显示 */
  const lotteryAnimationVisible = ref(false);

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const { lotterySdk, openLotteryByStatus } = useLotterySdk();

  /** 处理抽奖状态改变 */
  function onLotteryStatusChange(status: IarLotteryStatus) {
    openLotteryByStatus(status);
  }

  /** 处理抽奖动画显示状态改变 */
  function onVisibleChange(visible = false) {
    lotteryAnimationVisible.value = visible;
    if (visible) {
      toLockFeedDrag('lottery-animation');
    } else {
      toUnlockFeedDrag();
    }
  }

  useEventBusListener(appEvents.interaction.OpenLotteryAnimation, (data: { visible: boolean }) => {
    onVisibleChange(data.visible);
  });

  return {
    lotterySdk,
    lotteryAnimationVisible,
    onLotteryStatusChange,
    onVisibleChange,
  };
};
