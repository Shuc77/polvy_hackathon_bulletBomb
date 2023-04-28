import { translate } from '@/assets/lang';
import { getWatchCore } from '@/core/watch-sdk';
import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { AuthSettingItemExternal, ExternalAuthQueryParams } from '@polyv/live-watch-sdk';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';
import { paramGetter } from '@/hooks/core/use-query-params';

/**
 * 外部授权操作 hook
 */
export const useAuthExternalAction = () => {
  const watchAppStore = useWatchAppStore();
  const { handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  /**
   * 获取外部授权需要校验的参数
   */
  function getExternalAuthQueryParams(): ExternalAuthQueryParams {
    return {
      userid: paramGetter.userid() || '',
      ts: paramGetter.ts() || '',
      sign: paramGetter.sign() || '',
    };
  }

  /**
   * 允许验证外部授权
   */
  async function allowToVerifyExternalAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyExternalAuth(getExternalAuthQueryParams());
  }

  /**
   * 重定向到外部授权地址
   */
  async function redirectExternalFailUrl() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.redirectExternalFailUrl();

    // 跳转不成功，没有配置错误地址，显示本地的错误页
    if (!result) {
      watchAppStore.setPageError({
        type: PageErrorType.ExternalAuthFail,
        title: translate('auth.error.externalFail'),
      });
    }
  }

  /**
   * 验证外部授权
   */
  async function verifyAuthExternal() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyExternalAuth(getExternalAuthQueryParams());
    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      await handleAuthVerifyFail(result);
    }
  }

  return {
    allowToVerifyExternalAuth,
    redirectExternalFailUrl,
    verifyAuthExternal,
  };
};

export const useAuthExternal = () => {
  useAuthButtonInject<AuthSettingItemExternal>(onClickAuthButton);

  const { redirectExternalFailUrl } = useAuthExternalAction();

  /** 处理点击授权入口按钮 */
  function onClickAuthButton() {
    redirectExternalFailUrl();
  }
};
