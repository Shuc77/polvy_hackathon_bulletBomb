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
  function checkSaleInvite(): boolean {
    const isNeedSaleInviteVerify = watchCore.saleInvite.needSaleInviteVerify();
    if (!isNeedSaleInviteVerify) {
      return false;
    }

    if (!isWeixin) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: translate('pageError.saleInvite.limit.weixin'),
      });
      return true;
    }

    if (watchCore.saleInvite.isIllegalSaleCode()) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        desc: translate('pageError.saleInvite.illegalSaleCode'),
      });
      return true;
    }

    if (!weixinStore.weixinWatchAuthorized) {
      // 如果没有微信静默授权，则需要先进行授权
      redirectWeixinAuthorize({
        snsApiBase: false,
      });
      return true;
    }

    // 进入一客一码校验页面
    watchAppStore.setPageError({
      type: PageErrorType.VerifySaleInvite,
    });
    return true;
  }

  return {
    checkSaleInvite,
  };
};
