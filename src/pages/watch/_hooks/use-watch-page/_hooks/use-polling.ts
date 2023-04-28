/**
 * @file 观看页轮询相关的 hook
 */
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { onBeforeUnmount, watchEffect } from 'vue';
import { LiveStatus } from '@polyv/live-watch-sdk';
import { useChannelInfoStore } from '@/store/use-channel-info-store';

/**
 * 根据 liveStatus 设置 pv 轮询
 */
export const usePageViewPolling = () => {
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();

  watchEffect(() => {
    const watchCore = getWatchCore();

    if (channelStore.liveStatus === LiveStatus.Live) {
      watchCore.channel.startPageViewPolling((pageViewCount: number) => {
        if (channelInfoStore.pageViewCount !== pageViewCount) {
          channelInfoStore.$patch({
            pageViewCount,
          });
        }
      });
    } else {
      watchCore.channel.stopPageViewPolling();
    }
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.channel.stopPageViewPolling();
  });
};
