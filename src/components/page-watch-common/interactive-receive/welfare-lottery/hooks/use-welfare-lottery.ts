import { appEvents, useEventBusListener } from '@/app/app-events';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';
import { useEnrollStore } from '@/store/use-enroll-store';
import {
  forceChangePlvPopperManagerZIndex,
  recoverPlvPopperManagerZIndex,
} from '@/plugins/polyv-ui/helper';
import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

/**
 * @hook 互动-抽奖-条件抽奖
 * */
export const useWelfareLottery = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const interactReceiveStore = useInteractReceiveStore();
  const enrollStore = useEnrollStore();
  const { sendSpeakMsg } = useSendMsg();

  const watchCore = getWatchCore();
  /** 条件抽奖 SDK 实例 */
  const welfareLotterySdk = watchCore.interactReceive.getWelfareLottery();

  /** 参与评论、答题抽奖的拦截器 */
  const beforeJoinLottery = async (): Promise<boolean> => {
    if (enrollStore.needEnrollByChat) {
      getEmitter().emit(appEvents.global.OpenEnrollDialog);
      forceChangePlvPopperManagerZIndex(11000); // 需要大于 $--zIndex-top，11000 是互动抽奖功能里的层级
      return false;
    }

    recoverPlvPopperManagerZIndex();
    return true;
  };

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

  /**
   * 处理问卷抽奖，问卷弹窗填写
   * @param questionnaireId 问卷ID
   */
  const onToFillQuestionnaire = (questionnaireId: string) => {
    console.log('>>>> 显示抽奖问卷 set questionnaireBackBtnVisible:', false);
    interactReceiveStore.setQuestionnaireBackBtnVisible(false);
    getEmitter().emit(appEvents.interaction.OpenQuestionnaire, questionnaireId);
  };

  /** 处理条件抽奖入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.welfareLotteryPendantVisible = visible;
  };

  function onWelfareLotteryVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('welfare-lottery');
    } else {
      toUnlockFeedDrag();
    }
  }

  function onOpenRecord() {
    getEmitter().emit(appEvents.iar.OpenLotteryRecordDialog);
  }

  function onOpenReceive(data: { lotteryId: string }) {
    getEmitter().emit(appEvents.iar.OpenLotteryReceiveDialog, data.lotteryId);
  }

  return {
    welfareLotterySdk,
    beforeJoinLottery,
    onCommentSuccess,
    checkLotteryComment,
    onWelfareLotteryVisibleChanged,
    onEntryVisibleChanged,
    onToFillQuestionnaire,
    onOpenRecord,
    onOpenReceive,
  };
};
