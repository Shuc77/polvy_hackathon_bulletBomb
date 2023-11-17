import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useChatStore } from '@/store/use-chat-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { ChatMsgSource, ChatUserType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';

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

/**
 * 消息头衔隐藏 hook
 */
export const useHideChatMsgActorHook = () => {
  const hideActorUserType = computed(() => {
    return [ChatUserType.Student, ChatUserType.Slice, ChatUserType.Listener];
  });

  function needHideActorByUserType(userType?: ChatUserType) {
    if (!userType) return true;
    return hideActorUserType.value.includes(userType);
  }

  return {
    hideActorUserType,
    needHideActorByUserType,
  };
};
