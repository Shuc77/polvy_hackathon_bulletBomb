import { useChannelInfoStore } from '@/store/use-channel-info-store';

export const useLiveCountDown = () => {
  const channelInfoStore = useChannelInfoStore();

  function onCountDownFinish() {
    channelInfoStore.isLiveStartCountDownEnd = true;
  }

  return {
    onCountDownFinish,
  };
};
