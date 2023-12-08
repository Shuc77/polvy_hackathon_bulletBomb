import { translate } from '@/assets/lang';
import { ChannelMenuType } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useChannelMenuStore } from './use-channel-menu-store';
import { useChatStore } from './use-chat-store';
import { usePlaybackStore } from './use-playback-store';

export interface AskStore {
  /** 输入框占位符 */
  askInputPlaceholder: ComputedRef<string>;
  /** 提问欢迎语 */
  askWelcomeText: ComputedRef<string>;
  /** 提问红点是否显示 */
  askReminderVisible: Ref<boolean>;
}

export const useAskStore = defineStore<'ask', AskStore>('ask', () => {
  const chatStore = useChatStore();
  const channelMenuStore = useChannelMenuStore();
  const playbackStore = usePlaybackStore();

  /** 输入框占位符 */
  const askInputPlaceholder = computed(() => {
    if (chatStore.chatRoomIsClosed || playbackStore.chatReplayEnabled) {
      return translate('chat.input.placeholder');
    }

    return chatStore.chatInputPlaceholder;
  });

  /** 获取欢迎语 */
  const askWelcomeText = computed(() => {
    return (
      channelMenuStore.getMenuData(ChannelMenuType.Quiz)?.content || translate('ask.placeholderMsg')
    );
  });

  /** 提问消息红点提示是否可见 */
  const askReminderVisible = ref(false);

  return {
    askInputPlaceholder,
    askWelcomeText,
    askReminderVisible,
  };
});
