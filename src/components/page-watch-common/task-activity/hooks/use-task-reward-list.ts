import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { messageBox } from '@/components/common-base/message-box';
import { useScrollPagination } from '@/hooks/tools/use-page/use-scroll-page';
import {
  TaskRewardItem,
  TaskRewardStatus,
  RewardAcceptType,
  OutTradeErrorCode,
} from '@polyv/live-watch-sdk';
import { ref } from 'vue';

/**
 * 任务奖励 hook
 */
export const useTaskRewardList = () => {
  const visible = ref(false);
  const showClose = ref(false);

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const {
    scrollRef,
    contents: rewardList,
    refresh,
    onScroll,
  } = useScrollPagination<TaskRewardItem>(params => {
    return watchCore.taskActivity.getTaskRewardList({
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    });
  });

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

  function openReceive(item: TaskRewardItem) {
    switch (item.acceptInfo?.acceptType) {
      case RewardAcceptType.Form:
      case RewardAcceptType.QrCode:
        getEmitter().emit(appEvents.global.OpenTaskRewardReceiveDialog, item);
        break;
      case RewardAcceptType.Link:
        item.acceptInfo.prizeUrl && window.open(item.acceptInfo.prizeUrl, '_blank');
        break;
    }
  }

  function openErrorTips(item: TaskRewardItem) {
    if (!item.outTradeErrCode) {
      return;
    }
    let text = translate('taskActivity.rewardError.msg');

    switch (item.outTradeErrCode) {
      case OutTradeErrorCode.NotWechatUser:
        text = translate('taskActivity.rewardError.msg1');
        break;
      case OutTradeErrorCode.WxPayAccountError:
        text = translate('taskActivity.rewardError.msg2');
        break;
      case OutTradeErrorCode.SystemError:
        text = translate('taskActivity.rewardError.msg3');
        break;
    }

    messageBox({
      content: text,
      confirmButtonText: translate('base.popup.understood'),
    }).$confirm();
  }

  useEventBusListener(appEvents.global.RefreshTaskRewardList, refresh);

  return {
    visible,
    rewardList,
    scrollRef,
    onScroll,
    close,
    getRewardStatusText,
    showClose,
    openReceive,
    openErrorTips,
  };
};
