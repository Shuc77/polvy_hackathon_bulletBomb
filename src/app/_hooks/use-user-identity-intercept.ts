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
    let needLogin = watchCore.identity.checkIdentityLogin();
    // 游客登录由 UI 层自行限制
    if (identityStore.isGuest) {
      const allowGuest =
        identityStore.checkAllowUseGuest() &&
        !identityStore.allowToVerifyDirectAuth() &&
        !watchAppStore.shouldShowSplash;
      needLogin = !allowGuest;
    }

    if (needLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    // 游客登录就不再继续往下处理了
    if (identityStore.isGuest) {
      return false;
    }

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
