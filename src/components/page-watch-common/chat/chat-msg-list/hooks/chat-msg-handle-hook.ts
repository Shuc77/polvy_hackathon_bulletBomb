import { appEvents, eventBus } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { ChatEvents, ChatMsgImageType, ChatMsgType, SendMsgResult } from '@polyv/live-watch-sdk';
import { isUndefined } from 'lodash-es';
import { onBeforeUnmount, onMounted } from 'vue';
import { useSendMsg } from './send-msg-hook';
import { ChatMsgListHookOptions } from './types';

/**
 * 聊天室消息处理 hook
 */
export const useChatMsgHandle = (hookOptions: ChatMsgListHookOptions) => {
  const watchCore = getWatchCore();
  const chatMsgStore = useChatMsgStore();
  const { sendSystemMsg } = useSendMsg();

  /** -------------- 处理聊天室消息更新 -------------- */
  /**
   * 处理聊天室消息更新
   * @param msgResult 消息结果
   */
  function onChatMsgResultUpdate(msgResult: SendMsgResult<ChatMsgType>) {
    const localId = msgResult.localId;
    const chatMsg = msgResult.chatMsg;

    // 替换消息列表
    const historyIndex = chatMsgStore.findHistoryIndex(localId);
    if (historyIndex !== -1) {
      chatMsgStore.setHistoryData(historyIndex, chatMsg);
    }

    // 替换 realIndex
    const targetRealIndex = chatMsgStore.getRealIndexById(localId);
    if (!isUndefined(targetRealIndex)) {
      chatMsgStore.setRealIndexById(chatMsg.id, targetRealIndex);
      chatMsgStore.deleteRealIndexById(localId);
    }

    // 通知虚拟列表替换消息并重新渲染消息节点，确保消息的 id 为服务端消息
    const virtualList = hookOptions.getVirtualList();
    virtualList.updateItem(chatMsg, localId);
  }

  onMounted(() => {
    eventBus.$on(appEvents.chat.MsgResultUpdate, onChatMsgResultUpdate);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.chat.MsgResultUpdate, onChatMsgResultUpdate);
  });

  /** -------------- 处理图片违规 -------------- */
  function onImageIllegal(evt: { id: string; chatMsg: ChatMsgImageType }) {
    // 替换消息列表
    const historyIndex = chatMsgStore.findHistoryIndex(evt.id);
    if (historyIndex !== -1) {
      chatMsgStore.setHistoryData(historyIndex, evt.chatMsg);
    }

    // 通知虚拟列表替换消息并重新渲染消息节点
    const virtualList = hookOptions.getVirtualList();
    virtualList.updateItem(evt.chatMsg, evt.id);
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ImageIllegal, onImageIllegal);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.ImageIllegal, onImageIllegal);
  });

  /** -------------- 处理清空聊天室 -------------- */
  function onClearMsgHistory() {
    chatMsgStore.resetChatMsgStore();
    const virtualList = hookOptions.getVirtualList();
    virtualList.refresh();
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ClearMsgHistory, onClearMsgHistory);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.ClearMsgHistory, onClearMsgHistory);
  });

  /** -------------- 处理删除消息 -------------- */
  function onRemoveChatMsg(evt: { id: string }) {
    chatMsgStore.removeHistoryData(evt.id);
    const virtualList = hookOptions.getVirtualList();
    virtualList.removeItem(evt.id);
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.RemoveChatMsg, onRemoveChatMsg);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.RemoveChatMsg, onRemoveChatMsg);
  });

  /** -------------- 聊天室开关 -------------- */
  function onOpenChatRoom() {
    sendSystemMsg(translate('chat.roomReopened'));
  }

  function onCloseChatRoom() {
    sendSystemMsg(translate('chat.roomClosed'));
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.OpenChatRoom, onOpenChatRoom);
    watchCore.chat.eventEmitter.on(ChatEvents.CloseChatRoom, onCloseChatRoom);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.OpenChatRoom, onOpenChatRoom);
    watchCore.chat.eventEmitter.off(ChatEvents.CloseChatRoom, onCloseChatRoom);
  });
};
