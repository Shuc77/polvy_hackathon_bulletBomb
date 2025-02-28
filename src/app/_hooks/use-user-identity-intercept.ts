import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType } from '../layout/direct-business-page/type';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  function checkIdentityInfoLogin() {
    const watchCore = getWatchCore();

    const needLogin = watchCore.identity.checkIdentityLogin();
    if (needLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    return false;
  }

  return {
    checkIdentityInfoLogin,
  };
};
