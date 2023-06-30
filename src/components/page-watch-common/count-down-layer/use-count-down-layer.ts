import { computed } from 'vue';
import { ChannelPlayMode } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

export const useCountDownLayer = () => {
  const watchCore = getWatchCore();

  /** 是否显示右上角模式 */
  const isTopRightStyle = computed<boolean>(() => {
    const playMode = watchCore.channel.getChannelPlayMode();
    return typeof playMode !== 'undefined' && playMode !== ChannelPlayMode.End;
  });

  return {
    isTopRightStyle,
  };
};
