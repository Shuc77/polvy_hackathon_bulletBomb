import { appEvents, eventBus, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { toast } from '@/hooks/components/use-toast';
import { usePolling } from '@/hooks/tools/use-polling';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useTaskActivityStore } from '@/store/use-task-activity-store';
import {
  TaskActivityItem,
  TaskActivityReachCondition,
  TaskActivityRewardSetting,
  TaskActivityRewardType,
  TaskActivityStatus,
  TaskActivityType,
  TaskRewardItem,
  TaskRewardStatus,
} from '@polyv/live-watch-sdk';
import { ref, watch } from 'vue';

/**
 * 获取任务达成条件文案
 * @param reachCondition 达到条件
 */
export function getTaskReachText(reachCondition: TaskActivityReachCondition): string {
  let txt = '';

  // 达成条件
  switch (reachCondition.type) {
    case TaskActivityType.Sign:
      txt = translate('taskActivity.signCondition', {
        amount: `${reachCondition.amount}`,
      });
      break;
    case TaskActivityType.Online:
      txt = translate('taskActivity.onlineCondition', {
        amount: `${reachCondition.amount}`,
      });
      break;
  }

  return txt;
}

/**
 * 获取任务奖励文案
 * @param rewardSetting 任务奖励设置
 */
export function getTaskRewardText(rewardSetting: TaskActivityRewardSetting): string {
  let txt = '';

  switch (rewardSetting.type) {
    case TaskActivityRewardType.Cash:
      txt = translate('taskActivity.redpackReward', {
        amount: rewardSetting.amount,
      });
      break;
    case TaskActivityRewardType.Custom:
      txt = rewardSetting.customReward;
      break;
  }

  return txt;
}

/**
 * 任务活动 hook
 */
export const useTaskActivity = () => {
  const taskActivityStore = useTaskActivityStore();
  const interactReceiveStore = useInteractReceiveStore();

  /** 弹层显示状态 */
  const visible = ref(false);

  async function open() {
    await refreshActivityData();
    visible.value = true;
  }

  function refreshActivityData() {
    const watchCore = getWatchCore();
    return watchCore.taskActivity.refreshActivityData();
  }

  function onCountDownFinish() {
    setTimeout(() => {
      refreshActivityData();
    }, 1000);
  }

  watch(
    () => taskActivityStore.currentActivityData,
    () => {
      if (!taskActivityStore.currentActivityData) {
        visible.value = false;
      }
    },
  );

  /** 任务列表 */
  const { taskList } = storeDefinitionToRefs(useTaskActivityStore);

  /**
   * 获取任务标题
   * @param taskItem 任务节点
   */
  function getTaskTitle(taskItem: TaskActivityItem): string {
    let title = '';

    // 达成条件
    title += getTaskReachText(taskItem.reachCondition);

    // 奖励
    const rewardContent = getTaskRewardText(taskItem.rewardSetting);
    if (rewardContent) {
      title += translate('taskActivity.reward1', { content: rewardContent });
    }

    return title;
  }

  /**
   * 获取按钮文案
   * @param item 任务节点
   */
  function getButtonText(item: TaskActivityItem): string {
    let btnText = '';

    if (item.status === TaskActivityStatus.NotStart) {
      btnText = translate('taskActivity.lockedBtn');
    }

    if (item.status === TaskActivityStatus.InProgress) {
      switch (item.reachCondition.type) {
        case TaskActivityType.Sign:
          btnText = translate('taskActivity.signBtn');
          break;
        case TaskActivityType.Online:
          btnText = translate('taskActivity.onlineBtn');
          break;
      }
    }

    if (item.status === TaskActivityStatus.Finish) {
      btnText = translate('taskActivity.viewReward');
    }

    return btnText;
  }

  /** 是否显示按钮 */
  function showBtn(item: TaskActivityItem): boolean {
    // 已完成的任务但没有奖励时不显示按钮
    if (item.status === TaskActivityStatus.Finish) {
      if (item.rewardStatus === TaskRewardStatus.IssuedLimit) {
        return false;
      }

      const rewardContent = getTaskRewardText(item.rewardSetting);
      return !!rewardContent;
    }

    return true;
  }

  function onClickBtn(item: TaskActivityItem) {
    // 未解锁
    if (item.status === TaskActivityStatus.NotStart) {
      toast.error(translate('taskActivity.notStartToast'));
    }
    // 进行中
    if (item.status === TaskActivityStatus.InProgress) {
      // 签到任务
      if (item.reachCondition.type === TaskActivityType.Sign) {
        if (interactReceiveStore.hasCheckIn) {
          eventBus.$emit(appEvents.interaction.OpenCheckIn, true);
        } else {
          toast.error(translate('taskActivity.signError'));
        }
      }
      visible.value = false;
    }
    // 已完成
    if (item.status === TaskActivityStatus.Finish) {
      openReward();
    }
  }

  function openReward() {
    eventBus.$emit(appEvents.global.OpenTaskRewardDialog);
  }

  function getSurplusTime(item: TaskActivityItem): number {
    return item.reachCondition.amount * 60 - (item.reachCondition.currentSchedule || 0) / 1000;
  }

  useEventBusListener(appEvents.global.OpenTaskActivityDialog, open);
  useEventBusListener(appEvents.interaction.CheckInFinish, refreshActivityData);

  usePolling(() => {
    refreshActivityData();
  }, 5 * 60 * 1000);

  return {
    visible,
    taskList,
    getTaskTitle,
    getButtonText,
    onClickBtn,
    openReward,
    getSurplusTime,
    refreshActivityData,
    onCountDownFinish,
    showBtn,
  };
};

/**
 * 任务奖励 hook
 */
export const useTaskReward = () => {
  const visible = ref(false);
  const showClose = ref(false);

  const pageNumber = ref(1);
  let loading = false;
  let isNoMore = false;

  /** 奖励列表 */
  const rewardList = ref<TaskRewardItem[]>([]);

  async function getRewardList() {
    if (loading || isNoMore) {
      return;
    }
    const watchCore = getWatchCore();
    try {
      loading = true;
      const data = await watchCore.taskActivity.getTaskRewardList({
        pageNumber: pageNumber.value,
      });
      if (data.pageNumber === 1) {
        rewardList.value = data.contents;
      } else {
        rewardList.value = [...rewardList.value, ...data.contents];
      }
      loading = false;
      isNoMore = data.pageNumber >= data.totalPages;
    } catch (e) {
      loading = false;
    }
  }

  function scrollNearBottom() {
    if (loading || isNoMore) {
      return;
    }

    pageNumber.value += 1;
    getRewardList();
  }

  function open(_showClose = false) {
    showClose.value = _showClose;
    visible.value = true;
    pageNumber.value = 1;
    isNoMore = false;
    loading = false;
    getRewardList();
  }

  function close() {
    visible.value = false;
  }

  /**
   * 获取奖励状态文本
   * @param status 状态
   */
  function getRewardStatusText(status: TaskRewardStatus): string {
    let txt = translate('taskActivity.rewardStatus.notIssued');
    switch (status) {
      case TaskRewardStatus.Issued:
        txt = translate('taskActivity.rewardStatus.issued');
        break;
      case TaskRewardStatus.IssuedFail:
        txt = translate('taskActivity.rewardStatus.issuedFail');
        break;
    }
    return txt;
  }

  useEventBusListener(appEvents.global.OpenTaskRewardDialog, open);

  return {
    visible,
    rewardList,
    close,
    getRewardStatusText,
    scrollNearBottom,
    showClose,
  };
};
