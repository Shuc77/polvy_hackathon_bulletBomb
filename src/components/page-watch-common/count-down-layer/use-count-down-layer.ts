import { useChannelStore } from '@/store/use-channel-store';
import { computed } from 'vue';
import { ChannelPlayMode } from '@polyv/live-watch-sdk';

export const useCountDownLayer = () => {
  const channelStore = useChannelStore();

  /** 是否显示右上角模式 */
  const isTopRightStyle = computed<boolean>(() => {
    const playMode = channelStore.channelDetail?.playbackInfo?.playMode;
    return typeof playMode !== 'undefined' && playMode !== ChannelPlayMode.End;
  });

  return {
    isTopRightStyle,
  };
};
