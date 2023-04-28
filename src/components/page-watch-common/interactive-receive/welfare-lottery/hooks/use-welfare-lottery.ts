import { computed, onBeforeMount, onBeforeUnmount } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { useSendMsg } from '@/components/page-watch-common/chat/chat-msg-list/hooks/send-msg-hook';
import { YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';

/**
 * @hook 互动-抽奖-条件抽奖
 * */
export const useWelfareLottery = () => {
  const channelStore = useChannelStore();
  const interactReceiveStore = useInteractReceiveStore();
  const { sendSpeakMsg } = useSendMsg();

  const watchCore = getWatchCore();
  /** 条件抽奖 SDK 实例 */
  const welfareLotterySdk = watchCore.interactReceive.getWelfareLottery();

  /** 是否自动弹窗 */
  const conditionLotterySPAutoPopEnabled = computed<boolean>(() => {
    return ynToBool(
      channelStore.channelDetail?.channelConfig.conditionLotterySPAutoPopEnabled,
      YN.N,
    );
  });

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

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.CheckCommentLotteryComment, checkLotteryComment);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.CheckCommentLotteryComment, checkLotteryComment);
  });

  /** 处理条件抽奖入口显示状态改变 */
  const onEntryVisibleChanged = (visible = true) => {
    interactReceiveStore.welfareLotteryPendantVisible = visible;
  };

  return {
    welfareLotterySdk,
    conditionLotterySPAutoPopEnabled,
    onCommentSuccess,
    checkLotteryComment,
    onEntryVisibleChanged,
  };
};
