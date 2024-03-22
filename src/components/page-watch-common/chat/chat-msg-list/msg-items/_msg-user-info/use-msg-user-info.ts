import { computed, ComputedRef } from 'vue';
import { ChatMsgItemCategory } from '../use-chat-msg-item';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';
import { ChatMsgUserContext, useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';

export const useMsgUserInfo = (): ChatMsgUserContext & {
  /** 是否显示提问区标签 */
  showUserQuestionLabel: ComputedRef<boolean>;
} => {
  const {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    msgUserQuestionLabels,
    isSelfMsg,
    isSpecialUser,
    hideUserActor,
  } = useChatMsgUserInject();

  const chatMsgDataContext = useChatMsgDataInject();

  /**
   * 是否显示提问区标签
   */
  const showUserQuestionLabel = computed(() => {
    if (chatMsgDataContext.category.value !== ChatMsgItemCategory.Ask) {
      return false;
    }

    return msgUserQuestionLabels.value.length > 0;
  });

  return {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    msgUserQuestionLabels,
    isSelfMsg,
    isSpecialUser,
    hideUserActor,
    showUserQuestionLabel,
  };
};
