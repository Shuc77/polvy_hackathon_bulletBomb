import { getWatchCore } from '@/core/watch-sdk';
import { ErrorVerifyType, redirectToErrorVerify } from '@/hooks/core/use-error-verify';
import { useChatStore } from '@/store/use-chat-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ChatEvents, ChatEventsRelations } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';

export const useOnlineHook = () => {
  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  const watchCore = getWatchCore();

  /**
   * 检查登录的人数是否超出了最大在线人数
   * @param userId 用户 id
   */
  function checkMaxViewerCount(userId: string) {
    // 未聊天室并发限制开关
    if (!chatStore.chatSetting.restrictChatEnabled) {
      return false;
    }

    // 如果开启了虚拟人数开关，在线人数是假的，所以不需要踢出
    if (chatStore.chatSetting.chatRobotEnabled) {
      return false;
    }

    // 登录的非当前观众
    if (viewerStore.viewerId !== userId) {
      return false;
    }

    // 在线人数超出最大并发数则踢出当前用户
    const maxViewers = chatStore.chatSetting.maxViewers;
    const onlineUserCount = watchCore.chat.getOnlineUserCount();
    return onlineUserCount > maxViewers;
  }

  /** 处理 login 消息 */
  function onUserLogin(evt: ChatEventsRelations[ChatEvents.ChatUserLogin]) {
    const { user } = evt;
    const userId = user.userId;

    // 是否超出最大并发数，踢出当前用户
    const needKickUser = checkMaxViewerCount(userId);
    if (needKickUser) {
      redirectToErrorVerify({
        errorType: ErrorVerifyType.Restrict,
      });
    }
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLogin);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLogin);
  });
};
