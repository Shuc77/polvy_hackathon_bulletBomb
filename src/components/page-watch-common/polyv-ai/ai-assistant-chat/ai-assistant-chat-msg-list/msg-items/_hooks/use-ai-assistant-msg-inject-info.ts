import { usePolyvAIStore } from '@/store/use-polyv-ai-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { PolyvAIAssistantChatMsgSource } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { useAIAssistantMsgInject } from './use-ai-assistant-msg-common';

export const useAIAssistantMsgInjectInfo = () => {
  const { msg, msgPosition } = unref(useAIAssistantMsgInject());

  const polyvAIStore = usePolyvAIStore();
  const viewerStore = useViewerStore();

  const msgUserNick = computed(() => {
    return msg.user.nick;
  });

  const defaultUserAvatar = computed(() => {
    return msg.msgSource === PolyvAIAssistantChatMsgSource.Answer
      ? require('../_image/robot.png')
      : viewerStore.avatar;
  });

  const msgUserAvatar = computed(() => {
    return msg.user.pic || defaultUserAvatar.value;
  });

  /**
   * 是否为自己发言
   */
  const isSelfMsg = computed<boolean>(() => {
    return msg.user.userId === viewerStore.viewerId;
  });

  /**
   * 当前用户是否为 AI
   */
  const isAIUser = computed(() => {
    return msg.user.userId === String(polyvAIStore.AIAssistantConfig.aiAssistantId);
  });

  return {
    msgUserNick,
    msgUserAvatar,
    isSelfMsg,
    isAIUser,
    msgPosition,
  };
};
