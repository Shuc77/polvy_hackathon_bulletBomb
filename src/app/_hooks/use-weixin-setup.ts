import {
  useWeixinAuthorize,
  useWorkWeixinAuthorize,
} from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { useWeixinSdk } from '@/hooks/platform/use-weixin/use-weixin-sdk';
import { useWeixinShare } from '@/hooks/platform/use-weixin/use-weixin-share';
import { useAuthStore } from '@/store/use-auth-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { unref } from 'vue';
import { AuthType } from '@polyv/live-watch-sdk';
import { useViewerStore } from '@/store/use-viewer-store';

/**
 * @hook 处理微信流程
 * @returns 返回 true 则表示中断页面渲染，需要进行微信授权
 */
export const useWeixinSetup = async () => {
  const weixinStore = useWeixinStore();
  const viewerStore = useViewerStore();
  const authStore = useAuthStore();

  /**
   * 是否需要微信授权
   */
  function needWeixinAuthorized() {
    /**
     * 如果是付费观看进来的观众且没有进行非静默授权的，都要进行微信授权
     * 如：从非微信浏览器付费进入，再从微信端打开观看页
     */
    if (viewerStore.authType === AuthType.Pay && !weixinStore.weixinWatchAuthorized) {
      return true;
    }

    return !weixinStore.weixinAuthorized;
  }

  /**
   * 是否使用静默授权
   */
  function toSnsApiBase() {
    // 存在付费观看的观看条件则不使用静默授权
    if (authStore.hasAuth(AuthType.Pay)) {
      return false;
    }

    return true;
  }

  // 处理微信授权
  const { canWeixinAuthorize, redirectWeixinAuthorize } = useWeixinAuthorize();
  if (unref(canWeixinAuthorize) && needWeixinAuthorized()) {
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

  // 处理微信 js-sdk
  const { getWeixinSdk } = useWeixinSdk();
  const { configureWeixinShare } = useWeixinShare();
  if (unref(canWeixinAuthorize) || unref(canWorkWeixinAuthorize)) {
    await getWeixinSdk();
    await configureWeixinShare();
  }
};
