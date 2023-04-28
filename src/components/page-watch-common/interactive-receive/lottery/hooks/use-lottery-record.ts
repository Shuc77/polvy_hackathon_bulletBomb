import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { translate } from '@/assets/lang';
import { updateModelEmit, VueEmit } from '@/assets/utils/vue-utils/emit-utils';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';

import { LotteryRecordData } from '../types/lottery-types';
import { useLotteryRecordEntrance } from './use-lottery-record-entrance';

export const lotteryRecordProps = () => ({
  /** 抽奖记录是否显示，支持 .sync */
  visible: PropUtils.bool.def(false),
});

export const lotteryRecordEmits = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
});

/**
 * @hook 互动-抽奖-中奖记录
 * */
export const useLotteryRecord = (options: {
  props: VueProps<typeof lotteryRecordProps>;
  emit: VueEmit<typeof lotteryRecordEmits>;
}) => {
  const { props, emit } = options;

  const interactReceiveStore = useInteractReceiveStore();
  const { setLotteryRecordEntrance, removeLotteryRecordEntrance } = useLotteryRecordEntrance();

  const watchCore = getWatchCore();
  /** 抽奖 SDK 实例 */
  const lotterySdk = watchCore.interactReceive.getLottery();

  /** 中奖记录是否显示 */
  const lotteryRecordVisible = ref(false);

  watch(
    () => props.visible,
    () => {
      lotteryRecordVisible.value = props.visible;
    },
  );

  watch(
    () => lotteryRecordVisible.value,
    () => {
      emit('update:visible', lotteryRecordVisible.value);
    },
  );

  /** 设置中奖记录显示状态 */
  function setLotteryRecordVisible(visibleState = true) {
    lotteryRecordVisible.value = visibleState;
  }

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenLotteryRecord, setLotteryRecordVisible);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenLotteryRecord, setLotteryRecordVisible);
  });

  /** 处理中奖列表改变事件 */
  function onLotteryListChanged(lotteryList: LotteryRecordData[] = []) {
    interactReceiveStore.lotteryWinRecords = lotteryList;

    if (lotteryList.length) {
      setLotteryRecordEntrance();
    } else {
      removeLotteryRecordEntrance();
    }
  }

  /**
   * 处理显示中奖结果
   * @param record 中奖记录
   */
  function onShowLotteryResult(record: LotteryRecordData) {
    eventBus.$emit(appEvents.interaction.OpenLotteryResult, {
      visible: true,
      record,
    });
    setLotteryRecordVisible(false);
  }

  const lotteryRecordTitle = computed(() => translate('interact.lottery.record'));

  return {
    lotterySdk,
    lotteryRecordVisible,
    lotteryRecordTitle,
    setLotteryRecordVisible,
    onLotteryListChanged,
    onShowLotteryResult,
  };
};
