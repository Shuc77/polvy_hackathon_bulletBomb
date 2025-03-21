import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { isMobile } from '@/assets/utils/browser';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { computed, ref, watch } from 'vue';

export const usePersonalReward = () => {
  const { getEmitter } = useGlobalInject();

  const rewardTypes = computed(() => {
    return [
      { type: 'task-activity', text: translate('personalReward.taskEnter') },
      { type: 'lottery', text: translate('personalReward.lotteryEnter') },
      { type: 'lucky-lottery', text: translate('personalReward.luckyLotteryEnter') },
    ];
  });

  const currentType = ref('');

  const { visible, show, close } = useSimpleVisible(false);

  watch([visible, currentType], () => {
    if (visible.value) {
      switch (currentType.value) {
        case 'task-activity':
          getEmitter().emit(appEvents.global.RefreshTaskRewardList);
          break;
        case 'lottery':
          getEmitter().emit(appEvents.iar.RefreshLotteryRecordList);
          break;
        case 'lucky-lottery':
          getEmitter().emit(appEvents.iar.RefreshLuckyLotteryPrizeList);
          break;
      }
    }
  });

  useEventBusListener(
    appEvents.global.OpenPersonalRewardDialog,
    (type = !isMobile ? 'lottery' : 'task-activity') => {
      currentType.value = type;
      show();
    },
  );

  useEventBusListener(appEvents.iar.OpenLotteryRecordDialog, () => {
    currentType.value = 'lottery';
    show();
  });

  useEventBusListener(appEvents.iar.OpenLuckyLotteryPrizeListDialog, () => {
    currentType.value = 'lucky-lottery';
    show();
  });

  return {
    visible,
    close,
    show,

    rewardTypes,
    currentType,
  };
};
