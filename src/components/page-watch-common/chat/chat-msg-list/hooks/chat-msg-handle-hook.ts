import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { ChatEvents, ChatMsgType } from '@polyv/live-watch-sdk';
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
  const { sendSystemMsg, sendSpeakMsg } = useSendMsg();

  /**
   * 替换消息对象
   * @param id 消息 id
   * @param chatMsg 新的消息对象
   */
  function replaceChatMsg(id: string, chatMsg: ChatMsgType): void {
    // 替换消息列表
    const historyIndex = chatMsgStore.findHistoryIndex(id);
    if (historyIndex !== -1) {
      chatMsgStore.setHistoryData(historyIndex, chatMsg);
    }

    // 替换 realIndex
    const targetRealIndex = chatMsgStore.getRealIndexById(id);
    if (!isUndefined(targetRealIndex) && chatMsg.id !== id) {
      chatMsgStore.setRealIndexById(chatMsg.id, targetRealIndex);
      chatMsgStore.deleteRealIndexById(id);
    }

    // 通知虚拟列表替换消息并重新渲染消息节点，确保消息的 id 为服务端消息
    const virtualList = hookOptions.getVirtualList();
    virtualList.updateItem(chatMsg, id);
  }

  /** -------------- 处理聊天室消息更新 -------------- */
  /**
   * 处理聊天消息替换
   */
  function onReplaceChatMessage(evt: { id: string; chatMsg: ChatMsgType }) {
    replaceChatMsg(evt.id, evt.chatMsg);
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ReplaceChatMessage, onReplaceChatMessage);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.ReplaceChatMessage, onReplaceChatMessage);
  });

  /** -------------- 处理清空聊天室 -------------- */
  function onClearMsgHistory() {
    chatMsgStore.resetChatMsgStore();
    const virtualList = hookOptions.getVirtualList();
    virtualList.clear();
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

  /** -------------- 发送聊天消息 -------------- */
  function onSendMessageToChat(content: string): void {
    sendSpeakMsg({
      content,
    });
  }
  useEventBusListener(appEvents.chat.SendMessageToChat, onSendMessageToChat);
};
