import { useGlobalInject } from '@/app/use-global-inject';
import { SubmitWxLiveBookingOptions, CancelWxLiveBookingOptions } from '@polyv/live-watch-sdk';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { ref } from 'vue';
import { SubscribeInstance } from '../types';
import { useLiveBookingFail } from './use-live-booking-fail';

export const useLiveBookingWx = () => {
  const { getWatchCore } = useGlobalInject();
  const { toastBookingFail } = useLiveBookingFail();

  const liveBookingStore = useLiveBookingStore();

  const subscribeRef = ref<SubscribeInstance>();

  /** 提交微信预约 */
  async function wxSubmitLiveBooking(options?: SubmitWxLiveBookingOptions) {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.submitWxLiveBooking(options);

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount + 1;

      if (options?.otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
            isWxLiveBooking: true,
          },
        });
      } else {
        liveBookingStore.$patch({
          wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
          isWxLiveBooking: true,
        });
      }

      const isWxSubscribed = options?.otherChannelId
        ? liveBookingStore.singleOtherChannelBookingConfig?.isWxSubscribed
        : liveBookingStore.isWxSubscribed;

      // 未关注，弹出二维码弹层
      if (!isWxSubscribed) {
        subscribeRef.value?.openPopup();
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  /** 取消微信预约 */
  async function wxCancelLiveBooking(options?: CancelWxLiveBookingOptions) {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.cancelWxLiveBooking(options);

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount - 1;
      if (options?.otherChannelId) {
        liveBookingStore.$patch({
          singleOtherChannelBookingConfig: {
            wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
            isWxLiveBooking: false,
          },
        });
      } else {
        liveBookingStore.$patch({
          wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
          isWxLiveBooking: false,
        });
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  return {
    subscribeRef,
    wxSubmitLiveBooking,
    wxCancelLiveBooking,
  };
};
