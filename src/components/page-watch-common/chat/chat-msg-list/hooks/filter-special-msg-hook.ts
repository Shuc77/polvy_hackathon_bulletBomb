import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { ChatMsgSource, ChatMsgType } from '@polyv/live-watch-sdk';

export const useFilterSpecialMsgHook = () => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();

  /**
   * 是否为非特殊角色的消息
   * @param chatMsg 聊天消息
   * @param excludeCurrentUser 排除当前观众，默认 true
   */
  function isNotSpecialMsg(chatMsg: ChatMsgType, excludeCurrentUser = true) {
    const limitMsgSources = [ChatMsgSource.Speak, ChatMsgSource.Image, ChatMsgSource.Emotion];
    if (limitMsgSources.includes(chatMsg.msgSource)) {
      if (chatMsgStore.isSpecialUserMsg(chatMsg)) {
        return false;
      }

      if (excludeCurrentUser && chatMsgStore.isSelfMsg(chatMsg)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 过滤得到只有特殊角色消息的列表
   * @param list 聊天消息列表
   * @param excludeCurrentUser 排除当前观众，默认 true
   */
  function filterSpecialMsgList<T extends ChatMsgType = ChatMsgType>(
    list: T[],
    excludeCurrentUser = true,
  ): T[] {
    if (!chatStore.onlySpecialMsg) return list;

    return list.filter(chatMsg => !isNotSpecialMsg(chatMsg, excludeCurrentUser));
  }

  return {
    isNotSpecialMsg,
    filterSpecialMsgList,
  };
};
