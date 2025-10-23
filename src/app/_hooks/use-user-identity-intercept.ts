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

    if (needIdentityLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    // 游客登录就不再继续往下处理了
    if (identityStore.isGuest) {
      return false;
    }

    // ====
    // 剩余流程会尽量先补充好用户信息
    // ====

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

  return {
    checkIdentityInfoLogin,
  };
};
