import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useWeixinStore } from '@/store/use-weixin-store';
import { PolyvWatchCore } from '@polyv/live-watch-sdk';
import { useWeixinSdk } from './use-weixin-sdk';
import { useWeixinShare } from './use-weixin-share';

/**
 * @hook 处理微信相关配置
 * */
export const useWeixinConfig = () => {
  const weixinStore = useWeixinStore();

  const { getWeixinSdk } = useWeixinSdk();

  async function toConfigWeixinFeature(watchCore: PolyvWatchCore) {
    try {
      if (!(isWeixin || isWorkWeixin)) {
        return;
      }

      if (!weixinStore.wxSdkFeatureEnabled) {
        return;
      }

      const { configureWeixinShare } = useWeixinShare();

      watchCore.setWeixinSdk(getWeixinSdk);

      await getWeixinSdk();
      await configureWeixinShare();
    } catch (error) {
      console.error('toConfigWeixinFeature error', error);
    }
  }

  return {
    toConfigWeixinFeature,
  };
};

/**
 * @hook 更新微信分享配置
 * */
export const useWeixinShareConfigUpdate = () => {
  const weixinStore = useWeixinStore();

  async function updateWeixinShareConfig() {
    if (!(isWeixin || isWorkWeixin)) {
      return;
    }

    if (!weixinStore.wxSdkFeatureEnabled) {
      return;
    }

    const { configureWeixinShare } = useWeixinShare();

    await configureWeixinShare();
  }

  return {
    updateWeixinShareConfig,
  };
};
