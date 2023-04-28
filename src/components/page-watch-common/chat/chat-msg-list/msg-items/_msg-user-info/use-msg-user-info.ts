import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';

export const useMsgUserInfo = () => {
  const chatMsgUserContext = useChatMsgUserInject();

  return {
    ...chatMsgUserContext,
  };
};
