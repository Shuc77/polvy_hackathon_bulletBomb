import { ref, unref, watch } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';

/**
 * 直播开始提示 hook
 */
export const useLiveStartTips = () => {
  const watchCore = getWatchCore();
  const channelStore = useChannelStore();

  /** 提示是否显示 */
  const tipsVisible = ref(false);

  /** 打开提示 */
  function openTips() {
    tipsVisible.value = true;
  }

  /** 关闭提示 */
  function closeTips() {
    tipsVisible.value = false;
    if (channelStore.liveStatus === LiveStatus.Live) {
      watchCore.player.play();
    }
  }

  watch(
    () => unref(channelStore.liveStatus),
    (newStatus, oldStatus) => {
      if (!oldStatus) return;

      if (newStatus === LiveStatus.Live) {
        openTips();
      } else {
        closeTips();
      }
    },
    {
      immediate: true,
    },
  );

  return {
    tipsVisible,
    closeTips,
  };
};
