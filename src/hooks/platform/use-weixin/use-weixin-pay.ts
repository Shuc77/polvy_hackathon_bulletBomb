import { isFunction } from '@/assets/utils/function';
import { getWatchCore } from '@/core/watch-sdk';
import { useWeixinSdk } from './use-weixin-sdk';
import { LoggerName } from '@polyv/live-watch-sdk';

/** 微信的回调方法 */
type WeixinGeneralCallback = (res?: WechatJsSdk.GeneralCallbackResult) => void;

export interface WxPayCallback {
  /** 成功的回调 */
  successCb?: WeixinGeneralCallback;
  /** 取消的回调 */
  cancelCb?: WeixinGeneralCallback;
}

/**
 * @hook 微信支付
 */
export function useWeixinPay() {
  const { getWeixinSdk } = useWeixinSdk();

  /**
   * 唤起或监听微信 sdk 初始化完成后唤起微信支付
   * @param payInfo 微信支付相关信息
   * @param callback 支付相关回调
   */
  async function chooseWXPay(payInfo: WechatJsSdk.ChooseWXPayOption, callback: WxPayCallback = {}) {
    const { successCb, cancelCb } = callback;
    const wx = await getWeixinSdk();

    wx &&
      wx.chooseWXPay({
        timestamp: payInfo.timestamp,
        nonceStr: payInfo.nonceStr,
        package: payInfo.package,
        signType: payInfo.signType,
        paySign: payInfo.paySign,
        success: res => {
          if (isFunction<WeixinGeneralCallback>(successCb)) {
            successCb(res);
          }
        },
        cancel: res => {
          if (isFunction<WeixinGeneralCallback>(cancelCb)) {
            cancelCb(res);
          }
        },
        fail: res => {
          const watchCore = getWatchCore();
          watchCore.logger.error(LoggerName.Weixin, 'choose-wx-pay-fail', JSON.stringify(res));
        },
      });
  }

  return {
    chooseWXPay,
  };
}
