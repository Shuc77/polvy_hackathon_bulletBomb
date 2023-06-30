/**
 * @file 聊天消息用户相关 hook
 */
import { resetImageProtocol } from '@/assets/utils/image';
import { useChatMsgStore } from '@/store/use-chat-msg-store';
import { useViewerStore } from '@/store/use-viewer-store';
import {
  ChatMessageUser,
  ChatMsgType,
  ChatUserType,
  DEFAULT_VIEWER_AVATAR,
} from '@polyv/live-watch-sdk';
import { computed, ComputedRef, inject, InjectionKey, provide, unref } from 'vue';

/**
 * 聊天室消息用户上下文
 */
export interface ChatMsgUserContext {
  /** 消息的用户信息 */
  msgUser: ComputedRef<ChatMessageUser | undefined>;
  /** 消息的用户昵称 */
  msgUserNick: ComputedRef<string>;
  /** 消息的用户头像 */
  msgUserAvatar: ComputedRef<string>;
  /** 消息的用户类型 */
  msgUserType: ComputedRef<ChatUserType | undefined>;
  /** 消息的用户头衔 */
  msgUserActor: ComputedRef<string | undefined>;
  /** 是否为自己发言 */
  isSelfMsg: ComputedRef<boolean>;
  /** 是否为特殊用户 */
  isSpecialUser: ComputedRef<boolean>;
}

/**
 * 聊天消息用户相关 hook
 * @param chatMsgRef 聊天消息响应式对象
 */
export const useChatMsgUserBasic = (chatMsgRef: ResponsiveRef<ChatMsgType | undefined>) => {
  const viewerStore = useViewerStore();
  const chatMsgStore = useChatMsgStore();

  /**
   * 消息的用户信息
   */
  const msgUser = computed<ChatMessageUser | undefined>(() => {
    if (!chatMsgRef.value) {
      return;
    }
    return chatMsgStore.getChatMsgUser(chatMsgRef.value);
  });

  /**
   * 消息的用户昵称
   */
  const msgUserNick = computed<string>(() => {
    const user = unref(msgUser);
    return user?.nick ?? '';
  });

  /**
   * 消息的用户头像
   */
  const msgUserAvatar = computed<string>(() => {
    const user = unref(msgUser);
    return resetImageProtocol(user?.pic ?? DEFAULT_VIEWER_AVATAR);
  });

  /**
   * 消息的用户类型
   */
  const msgUserType = computed<ChatUserType | undefined>(() => {
    const user = unref(msgUser);
    return user?.userType;
  });

  /**
   * 消息的用户头衔
   */
  const msgUserActor = computed<string | undefined>(() => {
    const user = unref(msgUser);
    return user?.actor;
  });

  /**
   * 是否为自己发言
   */
  const isSelfMsg = computed<boolean>(() => {
    return unref(msgUser)?.userId === viewerStore.viewerId;
  });

  /**
   * 是否为特殊用户
   */
  const isSpecialUser = computed<boolean>(() => {
    if (!chatMsgRef.value) {
      return false;
    }
    return chatMsgStore.isSpecialUserMsg(chatMsgRef.value);
  });

  const chatMsgUserContext: ChatMsgUserContext = {
    msgUser,
    msgUserNick,
    msgUserAvatar,
    msgUserType,
    msgUserActor,
    isSelfMsg,
    isSpecialUser,
  };

  return chatMsgUserContext;
};

export const MSG_USER_INJECT_KEY: InjectionKey<ChatMsgUserContext> = Symbol('MsgUser');

/**
 * 注入聊天室消息用户
 * @param context
 */
export const useChatMsgUserProvide = (context: ChatMsgUserContext) => {
  provide(MSG_USER_INJECT_KEY, context);
};

/**
 * 获取聊天室消息用户的注入
 */
export const useChatMsgUserInject = () => {
  return inject(MSG_USER_INJECT_KEY) as ChatMsgUserContext;
};

type UseChatMsgUserOptions = {
  /** 聊天消息响应式对象 */
  chatMsg: ResponsiveRef<ChatMsgType | undefined>;
};

/**
 * 聊天室消息用户 hook
 * @param options
 * @param autoProvide
 */
export const useChatMsgUser = (options: UseChatMsgUserOptions, autoProvide = true) => {
  const { chatMsg } = options;

  const chatMsgUserContext = useChatMsgUserBasic(chatMsg);

  if (autoProvide) {
    useChatMsgUserProvide(chatMsgUserContext);
  }

  return chatMsgUserContext;
};
