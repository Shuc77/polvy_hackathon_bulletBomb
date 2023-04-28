import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useAuthCommon } from '../hooks/use-auth-common';
import { DirectAuthQueryParams } from '@polyv/live-watch-sdk';
import { paramGetter } from '@/hooks/core/use-query-params';

export const useAuthDirectAction = () => {
  const watchAppStore = useWatchAppStore();

  const { handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  /**
   * 获取独立授权需要校验的参数
   */
  function getDirectAuthQueryParams(): DirectAuthQueryParams {
    return {
      userid: paramGetter.userid() || '',
      ts: paramGetter.ts() || '',
      sign: paramGetter.sign() || '',
      nickname: paramGetter.nickname() || '',
    };
  }

  /**
   * 允许验证独立授权
   */
  async function allowToVerifyDirectAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyDirectAuth(getDirectAuthQueryParams());
  }

  /**
   * 重定向到独立授权失败页
   */
  async function redirectDirectFailUrl(): Promise<void> {
    watchAppStore.setPageError({
      type: PageErrorType.DirectAuthFail,
      title: translate('auth.error.directFail'),
    });
  }

  /**
   * 验证独立授权
   */
  async function verifyAuthDirect() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyDirectAuth(getDirectAuthQueryParams());
    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      await handleAuthVerifyFail(result);
    }
  }

  return {
    allowToVerifyDirectAuth,
    redirectDirectFailUrl,
    verifyAuthDirect,
  };
};
