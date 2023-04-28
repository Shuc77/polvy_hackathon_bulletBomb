import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { LiveBookingFailReason } from '@polyv/live-watch-sdk';

/**
 * 提示预约错误原因
 * @param failReason 错误原因
 */
export function toastBookingFail(failReason: LiveBookingFailReason) {
  switch (failReason) {
    case LiveBookingFailReason.Unknown:
      toast.error(translate('liveBooking.fail'));
      break;
    case LiveBookingFailReason.VerifyCodeError:
      toast.error(translate('liveBooking.smsWrong'));
      break;
  }
}
