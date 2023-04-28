import { useAuthStore } from '@/store/use-auth-store';
import { AuthType, YN } from '@polyv/live-watch-sdk';
import { useAuthCustomAction } from '../auth-custom/use-auth-custom';
import { useAuthDirectAction } from '../auth-direct/use-auth-direct';
import { useAuthExternalAction } from '../auth-external/use-auth-external';
import { ynToBool } from '@utils-ts/boolean';
import { useChannelStore } from '@/store/use-channel-store';

/**
 * 处理在页面进入后的特殊授权
 */
export const useAuthSpecial = () => {
  const authStore = useAuthStore();
  const channelStore = useChannelStore();

  /** 处理特殊授权 */
  async function handleSpecialAuth() {
    // 存在自定义授权
    if (authStore.hasAuth(AuthType.Custom)) {
      await doCustomAuth();
    }

    // 存在独立授权
    if (authStore.hasAuth(AuthType.Direct)) {
      await doDirectAuth();
    }

    // 存在外部授权
    if (authStore.hasAuth(AuthType.External)) {
      await doExternalAuth();
    }
  }

  /** 处理自定义授权逻辑 */
  async function doCustomAuth() {
    const { allowToVerifyCustomAuth, redirectCustomAuthUrl, verifyAuthCustom } =
      useAuthCustomAction();

    const allowCustomAuth = await allowToVerifyCustomAuth();
    if (allowCustomAuth) {
      await verifyAuthCustom();
    } else if (
      !authStore.isAuthorized &&
      authStore.onlyOneAuth &&
      !ynToBool(channelStore.channelDetail?.channelConfig.splashEnabled, YN.N)
    ) {
      /**
       * 满足以下条件则自动跳转到自定义授权链接
       * 1. 未授权（没有用户信息）
       * 2. 只有自定义授权
       * 3. 关闭了引导页开关
       */
      await redirectCustomAuthUrl();
    }
  }

  /** 处理外部授权逻辑 */
  async function doExternalAuth() {
    const { allowToVerifyExternalAuth, redirectExternalFailUrl, verifyAuthExternal } =
      useAuthExternalAction();

    const allowExternalAuth = await allowToVerifyExternalAuth();
    if (allowExternalAuth) {
      await verifyAuthExternal();
    } else if (
      !authStore.isAuthorized &&
      authStore.authSettingLength &&
      (authStore.authSettingLength === 1 || authStore.hasAuth(AuthType.Direct))
    ) {
      /**
       * 满足以下条件则跳到外部授权失败页
       * 1. 未授权（没有用户信息）
       * 2. [没有其他观看条件] 或 [另一个观看条件是独立授权]
       */
      await redirectExternalFailUrl();
    }
  }

  /** 处理独立授权逻辑 */
  async function doDirectAuth() {
    const { allowToVerifyDirectAuth, redirectDirectFailUrl, verifyAuthDirect } =
      useAuthDirectAction();

    const allowDirectAuth = await allowToVerifyDirectAuth();
    if (allowDirectAuth) {
      await verifyAuthDirect();
    } else if (!authStore.isAuthorized && authStore.onlyOneAuth) {
      /**
       * 满足以下条件则显示独立授权失败页
       * 1. 未授权（没有用户信息）
       * 2. 只有独立授权
       */
      await redirectDirectFailUrl();
    }
  }

  return {
    handleSpecialAuth,
    doCustomAuth,
  };
};
