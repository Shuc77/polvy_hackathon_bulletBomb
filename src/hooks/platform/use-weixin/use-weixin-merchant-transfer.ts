import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { LoggerName, WxMerchantTransferSignData } from '@polyv/live-watch-sdk';
import { WxCallback } from './types';
import { useWeixinJSBridge } from './use-weixin-js-bridge';
import { useWeixinSdk } from './use-weixin-sdk';

export const useWeixinMerchantTransfer = (hookCallback: WxCallback = {}) => {
  const { getWatchCore } = useGlobalInject();
  const { getWeixinSdk, checkJsApi } = useWeixinSdk();
  const { getWeixinJSBridge } = useWeixinJSBridge();

  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  async function requestMerchantTransfer(
    info: WxMerchantTransferSignData,
    callback: WxCallback = {},
  ) {
    const wx = await getWeixinSdk();
    const WeixinJSBridge = await getWeixinJSBridge();

    if (!wx) {
      throw new Error('获取微信 jssdk 实例失败');
    }

    await checkJsApi('requestMerchantTransfer');

    WeixinJSBridge?.invoke(
      'requestMerchantTransfer',
      {
        appId: info.appId,
        mchId: info.mchId,
        package: info.packageInfo,
      },
      async invokeRes => {
        if (invokeRes.err_msg === 'requestMerchantTransfer:ok') {
          await checkWithdrawStatus(info.outBillNo);
          toast.success(translate('withdraw.apply.success.msg'));
          hookCallback.successCb && hookCallback.successCb();
          callback.successCb && callback.successCb();
        } else {
          console.log('invokeRes.err_msg', invokeRes.err_msg);
          if (invokeRes.err_msg === 'requestMerchantTransfer:cancel') {
            hookCallback.cancelCb && hookCallback.cancelCb();
            callback.cancelCb && callback.cancelCb();
          }

          watchCore.logger.error(
            LoggerName.Weixin,
            'request-merchant-transfer-fail',
            JSON.stringify(invokeRes),
          );
        }
      },
    );
  }

  /**
   * 检查提现状态
   * @param outBillNo 提现单号
   */
  function checkWithdrawStatus(outBillNo: string): Promise<void> {
    return watchCore.withdraw.checkWithdrawStatus({ outBillNo });
  }

  return {
    requestMerchantTransfer,
    checkWithdrawStatus,
  };
};
