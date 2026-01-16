import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType } from '../layout/direct-business-page/type';
import { isWeixin } from '@/assets/utils/browser';
import { useIdentityStore } from '@/store/use-identity-store';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();
  const identityStore = useIdentityStore();
  const { getWatchCore } = useMultiPolyvWatchApp();

  const watchCore = getWatchCore();

  /** 用户登录成功拦截（授权后拦截） */
  async function toInterruptLoginAfter() {
    // 登录方式包含企微授权时，需要确保在微信环境下进行企微静默授权
    const needWorkWechatAuth = watchCore.identity.checkWorkWxSnsApiBaseEnabled();
    if (needWorkWechatAuth) {
      const { redirected } = await watchCore.identity.ensureWorkWxSnsAuth({
        getIsWeixin: () => isWeixin,
        getIsWorkWeixinAuthorized: () => watchCore.weixin.isWorkWeixinAuthorized(),
      });

      if (redirected) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查用户体系登录
   * @returns 返回 true 说明需要拦截
   */
  async function checkIdentityInfoLogin() {
    // 检查是否需要用户信息登录
    let needIdentityLogin = watchCore.identity.checkIdentityLogin();

    // UI 层自行限制游客身份是否能正常进入观看页
    if (!needIdentityLogin && identityStore.isGuest) {
      const allowGuest =
        identityStore.checkAllowUseGuest() &&
        !identityStore.allowToVerifyDirectAuth() &&
        !watchAppStore.shouldShowSplash;

      // 如果不允许游客身份登录，则强制正式用户登录
      if (!allowGuest) {
        needIdentityLogin = true;
      }
    }

    // 进入独立的认证页面
    if (needIdentityLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    // 游客登录的情况不用往下处理
    if (identityStore.isGuest) {
      return false;
    }

    // 授权后拦截，用于补充用户信息
    const redirected = await toInterruptLoginAfter();
    if (redirected) return true;

    return false;
  }

  return {
    checkIdentityInfoLogin,
  };
};
