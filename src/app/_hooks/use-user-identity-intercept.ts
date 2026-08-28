import { useWatchAppStore } from '@/store/use-watch-app-store';
import { DirectBusinessPageType, PageErrorType } from '../layout/direct-business-page/type';
import { isWeixin } from '@/assets/utils/browser';
import { useIdentityStore } from '@/store/use-identity-store';
import { YN, type PolyvWatchCore } from '@polyv/live-watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';
import { useQueryParams } from '@/hooks/core/use-query-params';

export const useUserIdentityIntercept = () => {
  const watchAppStore = useWatchAppStore();
  const identityStore = useIdentityStore();
  const channelStore = useChannelStore();

  const { paramGetter } = useQueryParams();

  /**
   * 拦截频道分组验证（目前分组依赖手机号）
   * @returns 返回 true 说明需要拦截
   */
  function interruptChannelGroupVerify(watchCore: PolyvWatchCore) {
    // 研讨会和小班课频道不拦截
    if (channelStore.isSeminarChannel || channelStore.isSmallClassChannel) {
      return false;
    }

    const channelViewerGroupConfig = watchCore.channel.getChannelViewerGroupConfig();

    // 如果频道分组未启用，则不拦截
    if (!channelViewerGroupConfig.channelViewerGroupEnabled) {
      return false;
    }

    // 如果没有权限观看，需要拦截跳转到错误页
    if (!channelViewerGroupConfig.notInGroupCanWatchEnabled) {
      watchAppStore.setPageError({
        type: PageErrorType.NotAllowAccess,
        title: translate('pageError.NotAllowAccess.title'),
      });
      return true;
    }

    const identityInfo = watchCore.identity.getIdentityUnionInfo();
    if (!identityInfo) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: 'not get identity info in channel group verify',
      });
      return true;
    }

    return false;
  }

  /** 用户登录成功拦截（授权后拦截） */
  async function toInterruptLoginAfter(watchCore: PolyvWatchCore) {
    // 登录方式包含企微授权时，需要确保在微信环境下进行企微静默授权
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

  /**
   * 检查用户体系登录
   * @returns 返回 true 说明需要拦截
   */
  async function checkIdentityInfoLogin(watchCore: PolyvWatchCore) {
    if (!identityStore.watchUserSystemEnabled) return false;

    // 检查是否需要用户信息登录
    let needIdentityLogin =
      paramGetter().forceUserAuth() === YN.Y ? true : watchCore.identity.checkIdentityLogin();

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

    // 进入独立的认证页面
    if (needIdentityLogin) {
      watchAppStore.setDirectBusinessPage({
        pageType: DirectBusinessPageType.WatchIdentity,
      });
      return true;
    }

    // 用户登录后再进行分组验证
    const interruptChannelGroupVerifyResult = interruptChannelGroupVerify(watchCore);
    if (interruptChannelGroupVerifyResult) {
      return true;
    }

    // 游客登录的情况不用往下处理
    if (identityStore.isGuest) {
      return false;
    }

    // 授权后拦截，用于补充用户信息
    const redirected = await toInterruptLoginAfter(watchCore);
    if (redirected) return true;

    return false;
  }

  return {
    checkIdentityInfoLogin,
  };
};
