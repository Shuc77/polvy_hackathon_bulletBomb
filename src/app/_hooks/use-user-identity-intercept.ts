import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType } from '../layout/direct-business-page/type';
import { isWeixin } from '@/assets/utils/browser';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  async function checkIdentityInfoLogin() {
    const watchCore = getWatchCore();

    const needLogin = watchCore.identity.checkIdentityLogin();
    if (needLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
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
