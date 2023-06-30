/**
 * @file 直播预约 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref, unref } from 'vue';
import { isMobile, isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useChannelInfoStore } from './use-channel-info-store';
import { getWatchCore } from '@/core/watch-sdk';

export interface LiveBookingStoreState {
  /** 是否使用微信预约 */
  useWxBooking: Ref<boolean>;
  /** 是否显示直播预约按钮 */
  showLiveBookingButton: ComputedRef<boolean>;
  /** 是否已短信预约 */
  isSmsLiveBooking: Ref<boolean>;
  /** 是否已微信预约 */
  isWxLiveBooking: Ref<boolean>;
  /** 是否已预约直播 */
  isLiveBooking: ComputedRef<boolean>;
  /** 是否已关注了微信公众号 */
  isWxSubscribed: Ref<boolean>;
  /** 微信预约弹层提示文案 */
  wxBookingTips: Ref<string>;
  /** 是否展示微信预约人数 */
  wxBookingCountVisible: Ref<boolean>;
  /** 微信预约人数 */
  wxBookingCount: Ref<number>;
  /** 微信公众号图片 */
  wxMpImageUrl: Ref<string>;
}

export interface LiveBookingStoreAction {
  /** 同步直播预约 Store 数据 */
  syncLiveBookingStore(): void;
}

export interface LiveBookingStore extends LiveBookingStoreState, LiveBookingStoreAction {}

export const useLiveBookingStore = defineStore<'liveBooking', LiveBookingStore>(
  'liveBooking',
  () => {
    const channelInfoStore = useChannelInfoStore();

    /** 是否开启了短信预约 */
    const smsBookingEnabled = ref(false);

    /** 是否开启了微信预约 */
    const wxBookingEnabled = ref(false);

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

      return unref(useWxBooking) || unref(smsBookingEnabled);
    });

    /** 是否已短信预约 */
    const isSmsLiveBooking = ref(false);

    /** 是否已微信预约 */
    const isWxLiveBooking = ref(false);

    /** 是否已预约直播 */
    const isLiveBooking = computed<boolean>(() => {
      return unref(useWxBooking) ? unref(isWxLiveBooking) : unref(isSmsLiveBooking);
    });

    /** 是否已关注了微信公众号 */
    const isWxSubscribed = ref(false);

    /** 微信预约弹层提示文案 */
    const wxBookingTips = ref('');

    /** 是否展示微信预约人数 */
    const wxBookingCountVisible = ref(false);

    /** 微信预约人数 */
    const wxBookingCount = ref(0);

    /** 微信公众号图片 */
    const wxMpImageUrl = ref('');

    /** 同步直播预约 Store 数据 */
    function syncLiveBookingStore(): void {
      const watchCore = getWatchCore();
      const liveBookingConfig = watchCore.liveBooking.getLiveBookingConfig();

      smsBookingEnabled.value = liveBookingConfig.smsBookingEnabled;
      isSmsLiveBooking.value = liveBookingConfig.isSmsLiveBooking;

      wxBookingEnabled.value = liveBookingConfig.wxBookingEnabled;
      isWxLiveBooking.value = liveBookingConfig.isWxLiveBooking;
      isWxSubscribed.value = liveBookingConfig.isWxSubscribed;
      wxBookingTips.value = liveBookingConfig.wxBookingTips;
      wxBookingCountVisible.value = liveBookingConfig.wxBookingCountVisible;
      wxBookingCount.value = liveBookingConfig.wxBookingCount;
      wxMpImageUrl.value = liveBookingConfig.wxMpImageUrl;
    }

    return {
      useWxBooking,
      showLiveBookingButton,
      isSmsLiveBooking,
      isWxLiveBooking,
      isLiveBooking,
      isWxSubscribed,
      wxBookingTips,
      wxBookingCountVisible,
      wxBookingCount,
      wxMpImageUrl,
      syncLiveBookingStore,
    };
  },
);
