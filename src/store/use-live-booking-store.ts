/**
 * @file 直播预约 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { ynToBool } from '@utils-ts/boolean';
import { YN } from '@polyv/live-watch-sdk';
import { isMobile, isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useChannelInfoStore } from './use-channel-info-store';

export interface LiveBookingStoreState {
  /** 是否开启了短信预约 */
  smsBookingEnabled: ComputedRef<boolean>;
  /** 是否开启了微信预约 */
  wxBookingEnabled: ComputedRef<boolean>;
  /** 微信预约弹层提示文案 */
  bookingTips: ComputedRef<string>;
  /** 是否使用微信预约 */
  useWxBooking: ComputedRef<boolean>;
  /** 是否显示直播预约按钮 */
  showLiveBookingButton: ComputedRef<boolean>;
  /** 是否已短信预约 */
  isSmsLiveBooking: Ref<boolean>;
  /** 是否已微信预约 */
  isWxLiveBooking: Ref<boolean>;
  /** 是否已预约直播 */
  isLiveBooking: ComputedRef<boolean>;
  /** 微信预约人数 */
  wxBookingCount: Ref<number>;
  /** 是否已关注了微信公众号 */
  isWxSubscribed: ComputedRef<boolean>;
  /** 微信公众号图片 */
  weixinMpImgUrl: ComputedRef<string>;
}

export interface LiveBookingStoreAction {
  /** 初始化直播预约数据 */
  initLiveBookingData(): void;
}

export interface LiveBookingStore extends LiveBookingStoreState, LiveBookingStoreAction {}

export const useLiveBookingStore = defineStore<'liveBooking', LiveBookingStore>(
  'liveBooking',
  () => {
    const channelStore = useChannelStore();
    const channelInfoStore = useChannelInfoStore();

    /** 是否开启了短信预约 */
    const smsBookingEnabled = computed<boolean>(() => {
      return ynToBool(channelStore.channelDetail?.smsBooking?.bookingEnabled, YN.N);
    });

    /** 是否开启了微信预约 */
    const wxBookingEnabled = computed<boolean>(() => {
      return ynToBool(channelStore.channelDetail?.wxBooking?.bookingEnabled, YN.N);
    });

    /** 微信预约弹层提示文案 */
    const bookingTips = computed<string>(() => {
      return channelStore.channelDetail?.channelConfig.bookingTips || '';
    });

    /** 是否使用微信预约 */
    const useWxBooking = computed<boolean>(() => {
      return isMobile && isWeixin && !isWorkWeixin && unref(wxBookingEnabled);
    });

    /** 是否显示直播预约按钮 */
    const showLiveBookingButton = computed<boolean>(() => {
      // 没有设置开始时间
      if (!channelInfoStore.liveStartTime) {
        return false;
      }

      // 倒计时结束
      if (channelInfoStore.isLiveStartCountDownEnd) {
        return false;
      }

      // 微信环境
      if (unref(useWxBooking)) {
        return unref(wxBookingEnabled);
      }

      // 非微信环境
      return unref(smsBookingEnabled);
    });

    /** 是否已短信预约 */
    const isSmsLiveBooking = ref(false);

    /** 是否已微信预约 */
    const isWxLiveBooking = ref(false);

    /** 是否已预约直播 */
    const isLiveBooking = computed<boolean>(() => {
      return unref(useWxBooking) ? unref(isWxLiveBooking) : unref(isSmsLiveBooking);
    });

    /** 微信预约人数 */
    const wxBookingCount = ref(0);

    /** 是否已关注了微信公众号 */
    const isWxSubscribed = computed<boolean>(() => {
      return ynToBool(channelStore.channelDetail?.wxBooking?.isSubscribed, YN.N);
    });

    /** 微信公众号图片 */
    const weixinMpImgUrl = computed<string>(() => {
      return channelStore.channelDetail?.wxBooking?.weixinMpImgUrl || '';
    });

    /** 初始化直播预约数据 */
    function initLiveBookingData(): void {
      isSmsLiveBooking.value = ynToBool(channelStore.channelDetail?.smsBooking?.booking, YN.N);
      isWxLiveBooking.value = ynToBool(channelStore.channelDetail?.wxBooking?.isWxBooking, YN.N);
      wxBookingCount.value = channelStore.channelDetail?.wxBooking?.bookingCount || 0;
    }

    return {
      smsBookingEnabled,
      wxBookingEnabled,
      bookingTips,
      useWxBooking,
      showLiveBookingButton,
      isSmsLiveBooking,
      isWxLiveBooking,
      isLiveBooking,
      wxBookingCount,
      isWxSubscribed,
      weixinMpImgUrl,
      initLiveBookingData,
    };
  },
);
