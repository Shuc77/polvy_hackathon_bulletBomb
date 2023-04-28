import { redirectToErrorVerify } from '@/hooks/core/use-error-verify';
import { useChatStore } from '@/store/use-chat-store';
import { ChatEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

/**
 * 监听聊天室模块事件
 */
export function bindChatModuleEvents(): void {
  const watchCore = getWatchCore();
  const chatStore = useChatStore();

  // 聊天室连接失败
  watchCore.chat.eventEmitter.on(ChatEvents.ChatConnectFail, () => {
    chatStore.connectError = true;
  });

  watchCore.chat.eventEmitter.on(ChatEvents.ChatStoreInfoChange, () => {
    chatStore.syncChatStore();
  });

  // 重复登录，页面跳走
  watchCore.chat.eventEmitter.on(ChatEvents.CurrentUserRelogin, () => {
    redirectToErrorVerify();
  });

  // 点赞数修改
  watchCore.chat.eventEmitter.on(ChatEvents.ChatLikeCountChange, data => {
    chatStore.$patch({
      realtimeLikes: data.realtimeLikes,
    });
  });
}
