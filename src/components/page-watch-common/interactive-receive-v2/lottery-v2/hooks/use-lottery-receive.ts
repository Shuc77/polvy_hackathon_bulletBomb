import { appEvents, useEventBusListener } from '@/app/app-events';
import type { LotteryReceiveInstance } from '@polyv/iar-lottery-ui';
import { ref } from 'vue';

export const useLotteryReceive = () => {
  const receiveRef = ref<LotteryReceiveInstance>();

  useEventBusListener(appEvents.iar.OpenLotteryReceiveDialog, (lotteryId: string) => {
    receiveRef.value?.setupRecordData(lotteryId);
  });

  return {
    receiveRef,
  };
};
