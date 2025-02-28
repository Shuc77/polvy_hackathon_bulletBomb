import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useLotteryRecordEntrance } from './use-lottery-record-entrance';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { type LotteryRecordInstance } from '@polyv/iar-lottery-ui';
import { type PolyvIarLotteryRecordData } from '@polyv/live-watch-sdk';
import { ref } from 'vue';

export const useLotteryRecordList = () => {
  const { getEmitter } = useGlobalInject();

  const interactRecordStore = useInteractReceiveStore();

  const { setLotteryRecordEntrance, removeLotteryRecordEntrance } = useLotteryRecordEntrance();

  const recordRef = ref<LotteryRecordInstance>();

  useEventBusListener(appEvents.iar.RefreshLotteryRecordList, () => {
    recordRef.value?.refreshRecord();
  });

  function openLotteryReceive(data: PolyvIarLotteryRecordData) {
    getEmitter().emit(appEvents.iar.OpenLotteryReceiveDialog, data.lotteryId);
  }

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

  return {
    recordRef,
    openLotteryReceive,
    onRecordList,
  };
};
