import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { YN, ChatMsgQuoteOriginType } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { ynToBool } from '@utils-ts/boolean';
import { useViewerStore } from '@/store/use-viewer-store';
import { appEvents, eventBus } from '@/app/app-events';
import { TAB_NAME_ASK } from '@/assets/constants/tab-name';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

/**
 * 聊天消息回复 hook
 * @param chatMsgRef 聊天消息
 */
export const useChatMsgQuote = (chatMsgRef: ResponsiveRef<ChatMsgQuoteOriginType>) => {
  const chatStore = useChatStore();
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const viewerStore = useViewerStore();
  const layoutStore = useLayoutStore();

  /** 能否进行引用回复 */
  const canQuoteReply = computed<boolean>(() => {
    if (watchAppStore.isWatchBackUrl) return false;

    // 当前处于提问不需要回复
    if (
      layoutStore.mobileMenuCurrentName === TAB_NAME_ASK ||
      layoutStore.pcAsideTabCurrentName === TAB_NAME_ASK
    ) {
      return false;
    }

    // 引用回复开关
    const quoteReplyEnabled = ynToBool(
      channelStore.channelDetail?.channelConfig.quoteReplyEnabled,
      YN.N,
    );

    // 聊天室是否被关闭
    const chatRoomIsClosed = chatStore.chatRoomIsClosed;

    return quoteReplyEnabled && !chatRoomIsClosed;
  });

  /** 点击回复 */
  function onClickQuote() {
    // 未设置昵称
    if (!viewerStore.hasNickname) {
      eventBus.$emit(appEvents.chat.OpenSetNick, true);
      return;
    }

    // 设置引用的消息
    chatStore.$patch({
      currentQuoteMsg: unref(chatMsgRef),
    });
    // 聚焦输入框
    eventBus.$emit(appEvents.chat.FocusToChatInput);
  }

  return {
    canQuoteReply,
    onClickQuote,
  };
};
