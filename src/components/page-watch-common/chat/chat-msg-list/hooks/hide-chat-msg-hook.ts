import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { ChatMsgSource } from '@polyv/live-watch-sdk';

/**
 * 消息隐藏 hook
 */
export const useHideChatMsgHook = () => {
  const chatStore = useChatStore();
  const chatMsgStore = useChatMsgStore();
  const layoutStore = useLayoutStore();

  const hideChatMsgSources: ChatMsgSource[] = [];

  /** ---------- 自定义消息是否显示 ---------- */
  if (!chatStore.chatSetting.showCustomMessageEnabled) {
    hideChatMsgSources.push(ChatMsgSource.CustomerMessage);
  }

  /** ---------- 竖屏不显示打赏消息 ---------- */
  if (layoutStore.isPortraitWatchLayout) {
    hideChatMsgSources.push(ChatMsgSource.Reward);
  }

  chatMsgStore.$patch({
    hideChatMsgSources,
  });
};
