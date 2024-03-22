import { getWatchCore } from '@/core/watch-sdk';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { PageErrorType } from '../layout/page-error/page-error-type';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();

  function checkIdentityInfoLogin() {
    const watchCore = getWatchCore();

    const needLogin = watchCore.identity.checkIdentityInfoLogin();
    if (needLogin) {
      watchAppStore.setPageError({
        type: PageErrorType.IdentityInfoInput,
      });
      return true;
    }

    return false;
  }

  return {
    checkIdentityInfoLogin,
  };
};
