import { useWeixinStore } from '@/store/use-weixin-store';
import { useWeixinSdk } from './use-weixin-sdk';
import { useWeixinShare } from './use-weixin-share';

/**
 * @hook 处理微信相关配置
 * */
export const useWeixinConfig = async () => {
  const weixinStore = useWeixinStore();

  const { getWeixinSdk } = useWeixinSdk();
  const { configureWeixinShare } = useWeixinShare();
  if (weixinStore.weixinAuthorized || weixinStore.workWeixinAuthorized) {
    await getWeixinSdk();
    await configureWeixinShare();
  }
};

/**
 * @hook 更新微信分享配置
 * */
export const updateWeixinShareConfig = async () => {
  const weixinStore = useWeixinStore();

  const { configureWeixinShare } = useWeixinShare();
  if (weixinStore.weixinAuthorized || weixinStore.workWeixinAuthorized) {
    await configureWeixinShare();
  }
};
