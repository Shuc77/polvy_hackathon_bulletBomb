/*
 * @Author: kim
 * @Description: 微信支付
 */
import { useWeixinPay, WxPayCallback } from '@/hooks/platform/use-weixin/use-weixin-pay';
import { isWeixin } from '@/assets/utils/browser';
import { toast } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';

export function usePay() {
  const { chooseWXPay } = useWeixinPay();

  const pay = (payload: WechatJsSdk.ChooseWXPayOption, callback: WxPayCallback = {}) => {
    // 非微信中打开
    if (!isWeixin) {
      toast.error(translate('weixin.error.toWechatPay'));
      return;
    }
    const { successCb, cancelCb } = callback;
    try {
      chooseWXPay(payload, {
        successCb: async () => {
          toast.success(translate('order.paySuccess'));
          successCb && successCb();
        },
        cancelCb: async () => {
          toast.success(translate('order.payCancel'));
          cancelCb && cancelCb();
        },
      });
    } catch (err) {
      const message = (err as Error).message;
      toast.error(message);
    }
  };

  return {
    pay,
  };
}
