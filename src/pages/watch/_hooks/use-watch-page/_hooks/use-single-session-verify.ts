import { DEFAULT_VERIFY_QUERY_FREQUENCY } from '@/assets/constants/defaults';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { onBeforeUnmount, onMounted } from 'vue';
import { ynToBool } from '@utils-ts/boolean';
import { VerifyViewerSessionFail, YN } from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { redirectToErrorVerify } from '@/hooks/core/use-error-verify';

/**
 * 唯一性登录验证
 */
export const useSingleSessionVerify = () => {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  function setChannelVerifyQueryFrequency(channelVerifyQueryFrequency?: number) {
    channelStore.$patch({
      channelVerifyQueryFrequency: channelVerifyQueryFrequency || DEFAULT_VERIFY_QUERY_FREQUENCY,
    });
  }

  let pollingTimer: number | undefined;

  /** 设置轮训器 */
  function setSingleVerifyPolling() {
    removeSingleVerifyPolling();

    pollingTimer = window.setTimeout(() => {
      verifySingleSession();
    }, channelStore.channelVerifyQueryFrequency * 1000);
  }

  /** 移除轮训器 */
  function removeSingleVerifyPolling() {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      pollingTimer = undefined;
    }
  }

  /** 验证观众登录的唯一性 */
  async function verifySingleSession() {
    const result = await watchCore.channel.verifyViewerSession();

    if (result.success) {
      setChannelVerifyQueryFrequency(result.channelVerifyQueryFrequency);
      setSingleVerifyPolling();
    } else {
      const failReason = result.failReason;
      let tips = '';

      if (failReason === VerifyViewerSessionFail.Unknow) {
        tips = translate('global.singleSession.error.unknow');
      }
      if (failReason === VerifyViewerSessionFail.RemoteLogin) {
        tips = translate('global.singleSession.error.relogin');
      }

      if (tips) {
        toast.error(tips);
      }

      setTimeout(() => {
        redirectToErrorVerify();
      }, 5 * 1000);
    }
  }

  onMounted(() => {
    setChannelVerifyQueryFrequency(
      channelStore.channelDetail?.channelConfig.channelVerifyQueryFrequency,
    );

    if (
      ynToBool(channelStore.channelDetail?.channelConfig.singleSessionVerify, YN.Y) &&
      !watchAppStore.isWatchBackUrl
    ) {
      verifySingleSession();
    }
  });

  onBeforeUnmount(() => {
    removeSingleVerifyPolling();
  });
};
