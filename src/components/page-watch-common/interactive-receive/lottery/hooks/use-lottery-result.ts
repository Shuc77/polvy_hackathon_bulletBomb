import { computed, onBeforeMount, onBeforeUnmount, ref, unref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';

import {
  AllLotteryResultStatus,
  LotteryRecordData,
  LotteryResultInstance,
} from '../types/lottery-types';

/**
 * @hook 互动-抽奖-抽奖结果
 * */
export const useLotteryResult = () => {
  const watchCore = getWatchCore();
  /** 抽奖 SDK 实例 */
  const lotterySdk = watchCore.interactReceive.getLottery();

  /** 抽奖结果组件实例 */
  const lotteryResultInstance = ref<LotteryResultInstance>();

  /** 抽奖结果是否显示 */
  const lotteryResultVisible = ref(false);
  /** 设置抽奖显示状态 */
  function setLotteryResultVisible(visible = true) {
    lotteryResultVisible.value = visible;
  }

  /** 将结果状态返回到上一级 */
  function backLotteryResult() {
    const instance = unref(lotteryResultInstance);
    if (instance?.toBack) {
      instance.toBack();
    }
  }

  /** 当前抽奖结果显示状态 */
  const lotteryResultStatus = ref<AllLotteryResultStatus>();
  /** 处理结果显示状态改变 */
  function onStatusChanged(status: AllLotteryResultStatus) {
    lotteryResultStatus.value = status;
  }

  /**
   * 处理打开抽奖记录事件
   * @param record 需要显示的抽奖记录
   */
  function onOpenLotteryResult(params: { visible: boolean; record?: LotteryRecordData }) {
    const { visible = true, record } = params;
    const instance = unref(lotteryResultInstance);
    if (record && instance?.setLottery) {
      instance.setLottery({
        ...record,
        isWinner: true,
      });
    }

    lotteryResultStatus.value = AllLotteryResultStatus.isShowLotteryEnd;
    backLotteryResult();

    setLotteryResultVisible(visible);
  }

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenLotteryResult, onOpenLotteryResult);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenLotteryResult, onOpenLotteryResult);
  });

  /** 抽奖标题 */
  const lotteryResultTitle = computed(() => {
    const titles: Record<AllLotteryResultStatus, string> = {
      isShowLotteryEnd: translate('interact.lottery.result'),
      isShowWinnerList: translate('interact.lottery.checkList'),
      isShowSubmitInfo: translate('interact.lottery.submitInfo'),
    };
    const status = unref(lotteryResultStatus) ?? AllLotteryResultStatus.isShowLotteryEnd;
    return titles[status];
  });

  const showBackable = computed(() => {
    return (
      lotteryResultStatus.value &&
      lotteryResultStatus.value !== AllLotteryResultStatus.isShowLotteryEnd
    );
  });

  return {
    lotterySdk,
    lotteryResultTitle,
    lotteryResultInstance,
    lotteryResultVisible,
    showBackable,
    setLotteryResultVisible,
    backLotteryResult,
    onStatusChanged,
  };
};
