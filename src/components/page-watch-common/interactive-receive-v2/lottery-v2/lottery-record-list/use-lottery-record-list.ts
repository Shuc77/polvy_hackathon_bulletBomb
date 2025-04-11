import { appEvents, useEventBusListener } from '@/app/app-events';
import { useLotteryRecordEntrance } from './use-lottery-record-entrance';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { type LotteryRecordInstance } from '@polyv/iar-lottery-ui';
import { type PolyvIarLotteryRecordData } from '@polyv/live-watch-sdk';
import { ref } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';

export const useLotteryRecordList = () => {
  const { getEmitter } = useGlobalInject();

  const interactRecordStore = useInteractReceiveStore();

  const { setLotteryRecordEntrance, removeLotteryRecordEntrance } = useLotteryRecordEntrance();

  const recordRef = ref<LotteryRecordInstance>();

  useEventBusListener(appEvents.iar.RefreshLotteryRecordList, () => {
    recordRef.value?.refreshRecord();
  });

  function onRecordList(list: PolyvIarLotteryRecordData[]) {
    interactRecordStore.$patch({
      lotteryWinRecords: list,
    });

    if (list.length) {
      setLotteryRecordEntrance();
    } else {
      removeLotteryRecordEntrance();
    }
  }

  function onShow() {
    getEmitter().emit(appEvents.global.OpenPersonalRewardDialog, 'lottery');
  }

  function onClose() {
    getEmitter().emit(appEvents.global.ClosePersonalRewardDialog);
  }

  return {
    recordRef,
    onRecordList,
    onShow,
    onClose,
  };
};
