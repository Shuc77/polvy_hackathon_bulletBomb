import { useChannelStore } from '@/store/use-channel-store';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { ynToBool } from '@utils-ts/boolean';
import { ChatMsgSource, YN } from '@polyv/live-watch-sdk';

/**
 * 消息隐藏 hook
 */
export const useHideChatMsgHook = () => {
  const channelStore = useChannelStore();
  const chatMsgStore = useChatMsgStore();

  const hideChatMsgSources: ChatMsgSource[] = [];

  /** ---------- 自定义消息是否显示 ---------- */
  const showCustomMessageEnabled = ynToBool(
    channelStore.channelDetail?.channelConfig.showCustomMessageEnabled,
    YN.N,
  );
  if (!showCustomMessageEnabled) {
    hideChatMsgSources.push(ChatMsgSource.CustomerMessage);
  }

  /** ---------- 竖屏不显示打赏消息 ---------- */
  if (channelStore.isPortraitWatchLayout) {
    hideChatMsgSources.push(ChatMsgSource.Reward);
  }

  chatMsgStore.$patch({
    hideChatMsgSources,
  });
};
