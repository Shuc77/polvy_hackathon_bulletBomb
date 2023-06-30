import { appEvents, useEventBusListener } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';

/**
 * @hook 互动-抽奖-条件抽奖
 * */
export const useWelfareLottery = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const { sendSpeakMsg } = useSendMsg();

  const watchCore = getWatchCore();
  /** 条件抽奖 SDK 实例 */
  const welfareLotterySdk = watchCore.interactReceive.getWelfareLottery();

  /**
   * 处理抽奖弹窗中的文本发言
   * @param comment 发言的文本
   */
  const onCommentSuccess = (comment: string) => {
    sendSpeakMsg({
      content: comment,
      onlyLocalMsg: true,
    });
  };

  /**
   * 检查发言文本是否符合评论抽奖条件后参与进抽奖中
   * @param comment 发言的文本
   */
  const checkLotteryComment = async (comment: string) => {
    const isSatisfy = await welfareLotterySdk.isBooleanToCommentLottery(comment);
    if (isSatisfy) {
      welfareLotterySdk.finishCommentLottery();
    }
  };

  useEventBusListener(appEvents.interaction.CheckCommentLotteryComment, checkLotteryComment);

  /** 处理条件抽奖入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.welfareLotteryPendantVisible = visible;
  };

  return {
    welfareLotterySdk,
    onCommentSuccess,
    checkLotteryComment,
    onEntryVisibleChanged,
  };
};
