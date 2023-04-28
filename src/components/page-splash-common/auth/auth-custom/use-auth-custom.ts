import { getWatchCore } from '@/core/watch-sdk';
import { AuthSettingItemCustom } from '@polyv/live-watch-sdk';
import { useAuthButtonInject } from '../hooks/use-auth-button';
import { useAuthCommon } from '../hooks/use-auth-common';

/**
 * 自定义授权操作 hook
 */
export const useAuthCustomAction = () => {
  const { handleAuthVerifySuccess, handleAuthVerifyFail } = useAuthCommon();

  /** 跳转到自定义授权地址 */
  async function redirectCustomAuthUrl() {
    const watchCore = getWatchCore();
    await watchCore.auth.redirectCustomAuthUrl();
  }

  /** 允许验证自定义授权 */
  async function allowToVerifyCustomAuth(): Promise<boolean> {
    const watchCore = getWatchCore();
    return watchCore.auth.allowToVerifyCustomAuth();
  }

  /** 验证自定义授权 */
  async function verifyAuthCustom() {
    const watchCore = getWatchCore();
    const result = await watchCore.auth.verifyCustomAuth();
    if (result.success) {
      await handleAuthVerifySuccess(result);
    } else {
      await handleAuthVerifyFail(result);
    }
  }

  return {
    redirectCustomAuthUrl,
    allowToVerifyCustomAuth,
    verifyAuthCustom,
  };
};

export const useAuthCustom = () => {
  useAuthButtonInject<AuthSettingItemCustom>(onClickAuthButton);

  const { redirectCustomAuthUrl } = useAuthCustomAction();

  /** 处理点击授权入口按钮 */
  function onClickAuthButton() {
    redirectCustomAuthUrl();
  }
};
