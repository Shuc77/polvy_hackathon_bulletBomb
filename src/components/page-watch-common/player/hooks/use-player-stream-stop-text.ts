import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';

export const usePlayerStreamStopText = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();
  const channelStore = useChannelStore();

  // 获取流停止文本
  const getStreamStopText = () => {
    // 上一次推流时间
    const lastPushStreamTime = watchCore.channel.getLastPushStreamTime();
    // 是否开启回放
    const enabledPlayback = watchCore.channel.getEnablePlayback();
    // 是否显示回放待生成文本，规则：上一次推流时间大于0，且回放开启
    const isShowWaitPlaybackText = lastPushStreamTime > 0 && enabledPlayback;
    // 回放待生成文本
    const noLiveText = isShowWaitPlaybackText
      ? translate('player.streamStop.waitPlayback')
      : translate('channel.noLive');

    return channelStore.privateSeminarChannel ? translate('seminar.noLive') : noLiveText;
  };

  return {
    getStreamStopText,
  };
};
