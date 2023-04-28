import { computed } from 'vue';
import { ynToBool } from '@utils-ts/boolean';
import { YN } from '@polyv/live-watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

/**
 * 关注设置 hook
 */
export const useFollowSetting = () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  /** 是否自动打开 */
  const followAutoShow = computed<boolean>(() => {
    if (watchAppStore.isWatchBackUrl) return false;

    return ynToBool(channelStore.channelDetail?.channelPromotion?.followAutoShow, YN.N);
  });

  /** 关注开关 */
  const followEnabled = computed<boolean>(() => {
    if (watchAppStore.isWatchBackUrl) return false;

    return ynToBool(channelStore.channelDetail?.channelPromotion?.followEnabled, YN.N);
  });

  /** 关注入口文案 */
  const followEntrance = computed<string>(() => {
    return channelStore.channelDetail?.channelPromotion?.followEntrance || '';
  });

  /** 关注图片 */
  const followImage = computed(() => {
    return channelStore.channelDetail?.channelPromotion?.followImage;
  });

  /** 关注提示文案 */
  const followTips = computed(() => {
    return channelStore.channelDetail?.channelPromotion?.followTips;
  });

  return {
    followAutoShow,
    followEnabled,
    followEntrance,
    followImage,
    followTips,
  };
};
