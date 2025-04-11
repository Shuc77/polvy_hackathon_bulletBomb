import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { type LotteryDialogInstance, type LotteryDialogType } from '@polyv/iar-lottery-ui';
import { computed, ref } from 'vue';

export const useLotteryDialog = () => {
  const { useV2Lottery } = storeDefinitionToRefs(useInteractReceiveStore);

  const dialogRenders = computed<LotteryDialogType[]>(() => {
    if (useV2Lottery.value) {
      // 返回空数组表示创建所有弹层
      return [];
    }

    return ['lottery-receive'];
  });

  const dialogRef = ref<LotteryDialogInstance>();

  useEventBusListener(appEvents.iar.OpenLotteryReceiveDialog, (lotteryId: string) => {
    dialogRef.value?.openLotteryReceive({ lotteryId });
  });

  return {
    dialogRenders,
    dialogRef,
  };
};
