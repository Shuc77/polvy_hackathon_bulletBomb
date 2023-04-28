import { throttle } from 'lodash-es';
import { useChatStore } from '@/store/use-chat-store';
import { onMounted, onBeforeUnmount } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';
import { ChatEvents, ChatEventsRelations, YN } from '@polyv/live-watch-sdk';
import { isNumber } from '@/assets/utils/number';
import { ynToBool } from '@utils-ts/boolean';
import { useChannelStore } from '@/store/use-channel-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { ErrorVerifyType, redirectToErrorVerify } from '@/hooks/core/use-error-verify';

export const useOnlineHook = () => {
  const channelStore = useChannelStore();
  const chatStore = useChatStore();
  const viewerStore = useViewerStore();

  const watchCore = getWatchCore();

  /** 设置在线人数 */
  const setOnlineUserCount = throttle((onlineUserCount: number) => {
    chatStore.$patch({
      onlineUserCount,
    });
  }, 1000);

  /**
   * 检查登录的人数是否超出了最大在线人数
   * @param onlineUserCount 在线人数
   */
  function checkMaxViewerCount(onlineUserCount: number, userId: string) {
    const channelDetail = channelStore.channelDetail;
    // 未聊天室并发限制开关
    if (!ynToBool(channelDetail?.channelConfig.restrictChatEnabled, YN.N)) {
      return false;
    }

    // 如果开启了虚拟人数开关，在线人数是假的，所以不需要踢出
    if (ynToBool(channelDetail?.channelConfig.chatRobotEnabled, YN.N)) {
      return false;
    }

    // 登录的非当前观众
    if (viewerStore.viewerId !== userId) {
      return false;
    }

    // 在线人数超出最大并发数则踢出当前用户
    const maxViewers = channelDetail?.channelConfig.maxViewers ?? Infinity;
    return onlineUserCount > maxViewers;
  }

  /** 处理 login 消息 */
  function onUserLogin(evt: ChatEventsRelations[ChatEvents.ChatUserLogin]) {
    const { userLoginMsg } = evt;
    const userId = userLoginMsg.user.userId;

    if (isNumber(userLoginMsg.onlineUserNumber)) {
      // 非分房间下才通过 Login 消息获取在线人数
      if (!chatStore.isSibRoom) {
        setOnlineUserCount(userLoginMsg.onlineUserNumber);
      }

      // 是否超出最大并发数，踢出当前用户
      const needKickUser = checkMaxViewerCount(userLoginMsg.onlineUserNumber, userId);
      if (needKickUser) {
        redirectToErrorVerify({
          errorType: ErrorVerifyType.Restrict,
        });
      }
    }
  }

  /** 处理 logout 消息 */
  function onUserLogout(evt: ChatEventsRelations[ChatEvents.ChatUserLogout]) {
    const { userLogoutMsg } = evt;

    // 非分房间下才通过 Login 消息获取在线人数
    if (!chatStore.isSibRoom && isNumber(userLogoutMsg.onlineUserNumber)) {
      setOnlineUserCount(userLogoutMsg.onlineUserNumber);
    }
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogin, onUserLogin);
    watchCore.chat.eventEmitter.on(ChatEvents.ChatUserLogout, onUserLogout);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogin, onUserLogin);
    watchCore.chat.eventEmitter.off(ChatEvents.ChatUserLogout, onUserLogout);
  });
};
