import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ChatMsgQuoteOriginType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { ChatMsgItemCategory } from '../use-chat-msg-item';
import { useChatMsgDataInject } from './chat-msg-data-hook';

/**
 * 聊天消息回复 hook
 * @param chatMsgRef 聊天消息
 */
export const useChatMsgQuote = (chatMsgRef: ResponsiveRef<ChatMsgQuoteOriginType>) => {
  const chatStore = useChatStore();
  const watchAppStore = useWatchAppStore();
  const viewerStore = useViewerStore();

  const { getEmitter } = useGlobalInject();

  const { category } = useChatMsgDataInject<ChatMsgQuoteOriginType>();

  /** 能否进行引用回复 */
  const canQuoteReply = computed<boolean>(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;

    // 当前处于提问不需要回复
    if (category.value === ChatMsgItemCategory.Ask) {
      return false;
    }

    // 引用回复开关
    const quoteReplyEnabled = !!chatStore.chatSetting.quoteReplyEnabled;

    // 聊天室是否被关闭
    const chatRoomIsClosed = chatStore.chatRoomIsClosed;

    return quoteReplyEnabled && !chatRoomIsClosed;
  });

  /** 点击回复 */
  function onClickQuote() {
    // 未设置昵称
    if (!viewerStore.hasNickname) {
      getEmitter().emit(appEvents.chat.OpenSetNick, true);
      return;
    }

    // 设置引用的消息
    chatStore.$patch({
      currentQuoteMsg: unref(chatMsgRef),
    });
    // 聚焦输入框
    getEmitter().emit(appEvents.chat.FocusToChatInput);
  }

  return {
    canQuoteReply,
    onClickQuote,
  };
};
