import { ErrorVerifyType, redirectToErrorVerify } from '@/hooks/core/use-error-verify';
import { useChatStore } from '@/store/use-chat-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ChatEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

/**
 * 监听聊天室模块事件
 */
export function bindChatModuleEvents(): void {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();
  const chatStore = useChatStore();

  // 聊天室连接失败
  watchCore.chat.eventEmitter.on(ChatEvents.ChatConnectFail, () => {
    chatStore.$patch({
      connectError: true,
    });

    if (!watchAppStore.watchPageInited) {
      watchAppStore.$patch({
        watchPageInited: true,
      });
    }
  });

  // 聊天室重连成功
  watchCore.chat.eventEmitter.on(ChatEvents.ChatReconnectSuccess, async () => {
    chatStore.$patch({
      connectError: false,
    });

    if (!watchAppStore.watchPageChatConnected) {
      watchAppStore.$patch({
        watchPageChatConnected: true,
      });
    }
  });

  // 聊天室基础信息变更
  watchCore.chat.eventEmitter.on(ChatEvents.ChatInfoChange, () => {
    chatStore.syncChatStore();
  });

  // 重复登录，页面跳走
  watchCore.chat.eventEmitter.on(ChatEvents.CurrentUserRelogin, params => {
    redirectToErrorVerify(params);
  });

  // 点赞数修改
  watchCore.chat.eventEmitter.on(ChatEvents.ChatLikeCountChange, () => {
    const realtimeLikes = watchCore.chat.getRealtimeLikes();
    chatStore.$patch({
      realtimeLikes,
    });
  });

  // 在线人数修改
  watchCore.chat.eventEmitter.on(ChatEvents.OnlineUserCountChange, () => {
    const onlineUserCount = watchCore.chat.getOnlineUserCount();
    chatStore.$patch({
      onlineUserCount,
    });
  });

  // 超出直播间最大在线人数
  watchCore.chat.eventEmitter.on(ChatEvents.OverMaxOnlineCount, () => {
    redirectToErrorVerify({
      errorType: ErrorVerifyType.Restrict,
    });
  });
}
