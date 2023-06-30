import { getWatchCore } from '@/core/watch-sdk';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { ref } from 'vue';
import { SubscribeInstance } from '../types';
import { toastBookingFail } from './use-live-booking-fail';

export const useLiveBookingWx = () => {
  const liveBookingStore = useLiveBookingStore();

  const subscribeRef = ref<SubscribeInstance>();

  /** 提交微信预约 */
  async function wxSubmitLiveBooking() {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.submitWxLiveBooking();

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount + 1;
      liveBookingStore.$patch({
        wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
        isWxLiveBooking: true,
      });

      // 未关注，弹出二维码弹层
      if (!liveBookingStore.isWxSubscribed) {
        subscribeRef.value?.openPopup();
      }
    } else {
      toastBookingFail(result.failReason);
    }
  }

  /** 取消微信预约 */
  async function wxCancelLiveBooking() {
    const watchCore = getWatchCore();
    const result = await watchCore.liveBooking.cancelWxLiveBooking();

    if (result.success) {
      const wxBookingCount = liveBookingStore.wxBookingCount - 1;
      liveBookingStore.$patch({
        wxBookingCount: wxBookingCount < 0 ? 0 : wxBookingCount,
        isWxLiveBooking: false,
      });
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
