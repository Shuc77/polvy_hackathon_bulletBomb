import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useWeixinSdk } from './use-weixin-sdk';
import { useWeixinShare } from './use-weixin-share';

/**
 * @hook 处理微信相关配置
 * */
export const useWeixinConfig = async () => {
  if (!(isWeixin || isWorkWeixin)) {
    return;
  }

  const weixinStore = useWeixinStore();
  if (!weixinStore.wxSdkFeatureEnabled) {
    return;
  }

  const { getWeixinSdk } = useWeixinSdk();
  const { configureWeixinShare } = useWeixinShare();

  await getWeixinSdk();
  await configureWeixinShare();
};

/**
 * @hook 更新微信分享配置
 * */
export const updateWeixinShareConfig = async () => {
  if (!(isWeixin || isWorkWeixin)) {
    return;
  }

  const weixinStore = useWeixinStore();
  if (!weixinStore.wxSdkFeatureEnabled) {
    return;
  }

  const { configureWeixinShare } = useWeixinShare();
  await configureWeixinShare();
};
