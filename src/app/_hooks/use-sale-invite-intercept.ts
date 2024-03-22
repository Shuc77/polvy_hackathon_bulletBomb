import { isWeixin } from '@/assets/utils/browser';
import { translate } from '@/assets/lang';

import { getWatchCore } from '@/core/watch-sdk';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useWeixinAuthorize } from '@/hooks/platform/use-weixin/use-weixin-authorize';
import { PageErrorType } from '../layout/page-error/page-error-type';

/**
 * 一客一码拦截
 * @hook
 */
export const useSaleInviteIntercept = () => {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();
  const weixinStore = useWeixinStore();

  const { redirectWeixinAuthorize } = useWeixinAuthorize();

  /**
   * 检查一客一码功能流程
   * @return 返回 false 表示无需额外处理，返回 true 表示进入一客一码流程
   */
  async function checkSaleInvite(): Promise<boolean> {
    try {
      const isNeedSaleInviteVerify = watchCore.saleInvite.needSaleInviteVerify();
      if (!isNeedSaleInviteVerify) {
        return false;
      }

      if (weixinStore.isWeixinSnapshotPageMode) {
        throw new Error('当前进入微信快照页，不进入一客一码流程');
      }

      if (watchCore.saleInvite.isIllegalSaleCode()) {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: translate('pageError.saleInvite.illegalSaleCode'),
        });
        return true;
      }

      const inviteCustomerUsageScenario = watchCore.saleInvite.getInviteCustomerUsageScenario();

      if (!isWeixin && inviteCustomerUsageScenario === 'wechat') {
        watchAppStore.setPageError({
          type: PageErrorType.UnknownError,
          desc: translate('pageError.saleInvite.limit.weixin'),
        });
        return true;
      }

      if (isWeixin && !weixinStore.weixinWatchAuthorized) {
        // 如果没有微信静默授权，则需要先进行授权
        redirectWeixinAuthorize({
          snsApiBase: false,
        });
        return true;
      }

      const canAutoVerify = watchCore.saleInvite.checkSaleInviteAutoVerify();
      if (canAutoVerify) {
        await watchCore.saleInvite.verifySaleInviteAuth();
        window.location.reload();
        return false;
      }

      //

      // 进入一客一码校验页面
      watchAppStore.setPageError({
        type: PageErrorType.VerifySaleInvite,
      });
      return true;
    } catch (error) {
      console.error('checkSaleInvite error', error);
      return false;
    }
  }

  return {
    checkSaleInvite,
  };
};
