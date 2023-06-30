import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useAuthCommon } from '../hooks/use-auth-common';
import { DirectAuthSignParams } from '@polyv/live-watch-sdk';
import { paramGetter, queryParams, removeQueryParam } from '@/hooks/core/use-query-params';
import { toast } from '@/hooks/components/use-toast';

export const useAuthDirectAction = () => {
  const watchAppStore = useWatchAppStore();

  const { failMessage, getDefaultFailMessage, handleAuthVerifySuccess, handleAuthVerifyFail } =
    useAuthCommon();

  /**
   * 获取独立授权需要校验的参数
   */
  function getDirectAuthSignParams(): DirectAuthSignParams {
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
    return watchCore.auth.allowToVerifyDirectAuth(getDirectAuthSignParams());
  }

  /**
   * 验证独立授权
   */
  async function verifyAuthDirect() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyDirectAuth(getDirectAuthSignParams(), queryParams);
    if (result.success) {
      await handleAuthVerifySuccess(result);
      removeQueryParam(['userid', 'avatar', 'ts', 'sign', 'nickname']);
    } else {
      await handleAuthVerifyFail(result);
      toast.warning(failMessage.value || getDefaultFailMessage());
    }
  }

  /**
   * 需要自动跳转到独立授权失败页面
   */
  function allowAutoRedirectDirectAuthFailUrl() {
    const watchCore = getWatchCore();
    return watchCore.auth.allowAutoRedirectDirectAuthFailUrl();
  }

  /**
   * 重定向到独立授权失败页
   */
  function redirectDirectFailUrl(): void {
    watchAppStore.setPageError({
      type: PageErrorType.DirectAuthFail,
      title: translate('auth.error.directFail'),
    });
  }

  return {
    getDirectAuthSignParams,
    allowToVerifyDirectAuth,
    verifyAuthDirect,
    allowAutoRedirectDirectAuthFailUrl,
    redirectDirectFailUrl,
  };
};
