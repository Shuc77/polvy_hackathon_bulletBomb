import {
  useWeixinAuthorize,
  useWorkWeixinAuthorize,
} from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useWeixinShare } from '@/hooks/platform/use-weixin/use-weixin-share';
import { useWeixinStore } from '@/store/use-weixin-store';
import { unref } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';

/**
 * @hook 处理微信流程
 * @returns 返回 true 则表示中断页面渲染，需要进行微信授权
 */
export const useWeixinSetup = async () => {
  const weixinStore = useWeixinStore();

  /**
   * 是否使用静默授权
   */
  function toSnsApiBase() {
    const watchCore = getWatchCore();
    return watchCore.weixin.getSnsApiBase();
  }

  // 处理微信授权
  const { canWeixinAuthorize, redirectWeixinAuthorize } = useWeixinAuthorize();
  if (unref(canWeixinAuthorize)) {
    await redirectWeixinAuthorize({
      snsApiBase: toSnsApiBase(),
    });
    return true;
  }

  // 处理企业微信授权
  const { canWorkWeixinAuthorize, redirectWorkWeixinAuthorize } = useWorkWeixinAuthorize();
  if (unref(canWorkWeixinAuthorize) && !weixinStore.workWeixinAuthorized) {
    await redirectWorkWeixinAuthorize();
    return true;
  }
};

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
