import { getWatchCore } from '@/core/watch-sdk';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { RenderPosition } from '@just4/virtual-list/types';
import { ChatEvents, ChatMsgSource, ChatMsgType } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';
import { useContractHistory, useContractQueue } from './contract-history-hook';
import { useFilterRepeatMsgHook, useFilterSpecialMsgHook } from './filter-chat-msg-hook';
import { ChatMsgListHookOptions } from './types';

export const useChatMsgQueue = (hookOptions: ChatMsgListHookOptions) => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const playbackStore = usePlaybackStore();

  const { contractHistoryData } = useContractHistory(hookOptions);
  const { contractMsgQueue } = useContractQueue();
  const { isNotSpecialMsg } = useFilterSpecialMsgHook();
  const { filterRepeatMsg } = useFilterRepeatMsgHook(hookOptions);

  let joinTimer: number | undefined;

  /**
   * 插入一条新消息到队列中
   * @param chatMsg 消息
   */
  function pushMsgQueue(chatMsg: ChatMsgType): void {
    const virtualList = hookOptions.getVirtualList();

    if (chatMsgStore.getRealStartIndex() > 0) {
      if (chatMsgStore.isChatServiceMsg(chatMsg)) {
        chatMsgStore.increaseRealIndex();
      }
      chatMsgStore.showMoreMsg();
      virtualList.resetBoundaryState(RenderPosition.Foot);
      return;
    }

    chatMsgStore.pushMsgQueue(chatMsg);
    contractMsgQueue();

    // 服务端的消息才更新 realIndex
    if (chatMsgStore.isChatServiceMsg(chatMsg)) {
      chatMsgStore.increaseRealIndex();
      chatMsgStore.setRealIndexById(chatMsg.id, 0);
      chatMsgStore.setRealStartIndex(0);
    }

    // 插入到是本地消息
    if (chatMsgStore.isLocalMsg(chatMsg)) {
      // 直接将队列消息插入，不需要延迟
      let addList = chatMsgStore.concatQueueToHistoryData(true);
      contractHistoryData();

      addList = filterRepeatMsg(addList);
      virtualList.addBoundaryItems(addList, RenderPosition.Foot, true);
    }

    checkJoinTimer();
  }

  /**
   * 检查定时器
   */
  function checkJoinTimer() {
    // 消息队列为空，则关闭定时器
    if (chatMsgStore.getMsgQueue().length === 0) {
      removeJoinTimer();
      return;
    }

    // 已有定时器则不再创建
    if (joinTimer) {
      return;
    }

    // 启动定时器用于消息出队进行渲染
    startJoinTimer();
  }

  /**
   * 开启插入定时器
   */
  function startJoinTimer() {
    removeJoinTimer();

    joinTimer = window.setInterval(() => {
      const virtualList = hookOptions.getVirtualList();
      const container = hookOptions.getContainerElem();
      // 是否在底部(50为误差值)
      const isBottom = container.scrollTop + container.clientHeight + 50 >= container.scrollHeight;
      const footIsBoundary = virtualList.reachedBoundary(RenderPosition.Foot);

      if (footIsBoundary) {
        let renderData = chatMsgStore.concatQueueToHistoryData(true);
        renderData = filterRepeatMsg(renderData);

        if (renderData.length) {
          if (isBottom && renderData.length) {
            virtualList.addBoundaryItems(renderData, RenderPosition.Foot, true);
            chatMsgStore.hideMoreMsg();
          } else {
            /**
             * 重置滚动列表的状态
             * 如果当前在最底部往上滚一点点，此时收到消息时如果不重置，重新滚到下方不会加载新消息
             */
            virtualList.resetBoundaryState(RenderPosition.Foot);
            chatMsgStore.showMoreMsg();
          }
        }
      } else {
        chatMsgStore.showMoreMsg();
      }

      contractHistoryData();
      checkJoinTimer();
    }, 300);
  }

  /**
   * 销毁插入定时器
   */
  function removeJoinTimer() {
    if (joinTimer) {
      clearInterval(joinTimer);
      joinTimer = undefined;
    }
  }

  function onChatMsg(evt: { chatMsg: ChatMsgType }) {
    const chatMsg = evt.chatMsg;

    // 对于仅看主持人，非特殊身份，非自己发言的全部过滤掉
    if (chatStore.onlySpecialMsg && isNotSpecialMsg(chatMsg)) {
      return;
    }

    // 非聊天重放状态下，自己的打赏只接收本地插入的
    if (
      !playbackStore.chatReplayEnabled &&
      chatMsg.msgSource === ChatMsgSource.Reward &&
      chatMsg.isSelf &&
      !chatMsg.isLocal
    ) {
      return;
    }

    pushMsgQueue(chatMsg);
  }

  /**
   * 监听聊天室消息
   */
  function listenChatMsg() {
    unlistenChatMsg();
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.on(ChatEvents.ChatMessage, onChatMsg);
  }

  function unlistenChatMsg() {
    const watchCore = getWatchCore();
    watchCore.chat.eventEmitter.off(ChatEvents.ChatMessage, onChatMsg);
  }

  onMounted(() => {
    listenChatMsg();
  });

  onBeforeUnmount(() => {
    removeJoinTimer();
    unlistenChatMsg();
  });
};
