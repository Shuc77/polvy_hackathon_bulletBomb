/*
 * @Author: kim
 * @Description: 微信支付
 */
import { useWeixinPay } from '@/hooks/platform/use-weixin/use-weixin-pay';
import { isWeixin } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { WxCallback } from '@/hooks/platform/use-weixin/types';

export function usePay() {
  const { toast } = useToastManager();

  const { chooseWXPay } = useWeixinPay();

  const pay = (payload: WechatJsSdk.ChooseWXPayOption, callback: WxCallback = {}) => {
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
