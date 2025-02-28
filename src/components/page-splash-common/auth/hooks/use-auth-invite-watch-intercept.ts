import { DirectBusinessPageType, PageErrorType } from '@/app/layout/direct-business-page/type';
import { translate } from '@/assets/lang';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { PolyvWatchCore } from '@polyv/live-watch-sdk';

/**
 * 邀请观看拦截
 */
export const useAuthInviteWatchIntercept = () => {
  const watchAppStore = useWatchAppStore();

  /**
   * 检查邀请观看功能流程
   * @return 返回 false 表示无需额外处理，返回 true 表示进入邀请观看流程
   */
  async function checkInviteWatch(watchCore: PolyvWatchCore, opts: { saleId?: string }) {
    try {
      const allowInviteWatchAuth = watchCore.auth.allowInviteWatchAuth();

      if (!allowInviteWatchAuth) {
        return false;
      }

      if (!opts.saleId) {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: translate('inviteWatch.notAllow.tips'),
        });
        return true;
      }

      const verifyResult = await watchCore.auth.verifyInviteWatchAuth({
        saleId: opts.saleId,
      });
      if (verifyResult.success) {
        watchAppStore.setDirectBusinessPage({
          pageType: DirectBusinessPageType.InviteWatchAuditing,
        });
      } else {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: verifyResult.failMessage || translate('base.error.unknown'),
        });
      }

      return true;
    } catch (error) {
      console.error('checkInviteWatch error', error);
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: translate('base.error.unknown'),
      });
      return true;
    }
  }

  return {
    checkInviteWatch,
  };
};
