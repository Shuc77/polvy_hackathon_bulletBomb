import { LiveStatus, ChatEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, watch } from 'vue';

import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';

import { useIarGlobalConfigHook } from '@/components/page-watch-common/interactive-receive/use-iar-global-config';

import { useMainScreen } from './_hooks/use-main-screen';
import { usePageViewPolling, usePolyvMeetingPolling } from './_hooks/use-polling';
import { getWatchCore } from '@/core/watch-sdk';
import { ErrorVerifyType, redirectToErrorVerify } from '@/hooks/core/use-error-verify';

import { useChannelStore } from '@/store/use-channel-store';

const useWhiteListRemoveUser = () => {
  const watchCore = getWatchCore();

  function onWhiteListRemoveUser() {
    redirectToErrorVerify({
      errorType: ErrorVerifyType.isKicked,
    });
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.WhiteListRemoveUser, onWhiteListRemoveUser);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.WhiteListRemoveUser, onWhiteListRemoveUser);
  });
};

export const useWatchPage = async () => {
  // 支持白名单移除用户逻辑
  useWhiteListRemoveUser();

  // 使用 pv 轮训
  usePageViewPolling();

  // 使用会议模式轮询
  usePolyvMeetingPolling();

  // 设置互动功能全局配置
  useIarGlobalConfigHook();

  // 主副屏响应切换逻辑
  useMainScreen();

  // 研讨会"内部研讨"逻辑
  const channelStore = useChannelStore();
  watch(
    () => channelStore.liveStatus,
    liveStatus => {
      if (liveStatus !== LiveStatus.Live && channelStore.privateSeminarChannel) {
        toast.info(translate('seminar.hostCloseLive'));
      }
    },
    {
      immediate: true,
    },
  );
};
