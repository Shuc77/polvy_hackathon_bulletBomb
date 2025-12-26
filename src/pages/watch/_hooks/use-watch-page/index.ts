import { LiveStatus, ChatEvents } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, watch } from 'vue';

import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';

import { useIarGlobalConfigHook } from '@/components/page-watch-common/interactive-receive/use-iar-global-config';

import { useMainScreen } from './_hooks/use-main-screen';
import { usePageViewPolling, usePolyvMeetingPolling } from './_hooks/use-polling';
import { ErrorVerifyType, useErrorVerify } from '@/hooks/core/use-error-verify';

import { useChannelStore } from '@/store/use-channel-store';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useIarGlobalConfigHookV2 } from '@/components/page-watch-common/interactive-receive-v2/use-iar-global-config-v2';
import { installVueComponents } from '@/plugins/vue-components';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { isWeixin } from '@/assets/utils/browser';
import { useWeixinMiniProgramHelper } from '@/hooks/platform/use-weixin/use-weixin-button';
import { useGlobalInject } from '@/app/use-global-inject';

const useWhiteListRemoveUser = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const { redirectToErrorVerify } = useErrorVerify();

  const watchCore = getWatchCore();

  function onWhiteListRemoveUser() {
    redirectToErrorVerify({
      errorType: ErrorVerifyType.IsKicked,
    });
  }

  onMounted(() => {
    watchCore.chat.eventEmitter.on(ChatEvents.WhiteListRemoveUser, onWhiteListRemoveUser);
  });

  onBeforeUnmount(() => {
    watchCore.chat.eventEmitter.off(ChatEvents.WhiteListRemoveUser, onWhiteListRemoveUser);
  });
};

const useXAuthTokenExport = () => {
  const { getWatchCore } = useGlobalInject();
  const { getWeixinSdk } = useWeixinSdk();
  const { checkWxMiniProgramWebview } = useWeixinMiniProgramHelper();

  const watchCore = getWatchCore();

  async function exportXAuthInMiniProgram() {
    if (!isWeixin) {
      return;
    }

    const wx = await getWeixinSdk();
    if (!wx) {
      console.error('Failed to get getWeixinSdk');
      return;
    }

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    console.warn('exportXAuthInMiniProgram');
    if (isWxMiniProgramWebview) {
      wx.miniProgram?.postMessage({
        data: {
          event: 'live-watch-export-xAuthToken',
          data: {
            token: watchCore.getXAuthToken(),
            channelId: watchCore.channel.getChannelId(),
          },
        },
      });
    }
  }

  onMounted(() => {
    exportXAuthInMiniProgram();
  });
};

const usePrivateSeminarChannelEffect = () => {
  const { toast } = useToastManager();

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

export const useWatchPage = async () => {
  // 支持白名单移除用户逻辑
  useWhiteListRemoveUser();

  // 使用 pv 轮训
  usePageViewPolling();

  // 使用会议模式轮询
  usePolyvMeetingPolling();

  // 设置互动功能全局配置
  useIarGlobalConfigHook();
  useIarGlobalConfigHookV2();

  // 设置 vue-components 全局配置
  installVueComponents();

  // 主副屏响应切换逻辑
  useMainScreen();

  // 研讨会"内部研讨"逻辑
  usePrivateSeminarChannelEffect();

  // xAuthToken 对外暴露
  useXAuthTokenExport();
};
