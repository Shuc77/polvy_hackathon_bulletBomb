import { getWatchCore } from '@/core/watch-sdk';
import { ref } from 'vue';
import { ChannelEvents } from '@polyv/live-watch-sdk';
import { generateRandomInteger } from '@/assets/utils/utils';

export const useTransmitSwitchTip = () => {
  const watchCore = getWatchCore();
  const transmitSwitchTipVisible = ref(false);

  const reloadPage = () => {
    window.location.reload();
  };

  const channelEventEmitter = watchCore.channel.eventEmitter;
  channelEventEmitter.on(ChannelEvents.TransmitChannelSwitch, params => {
    if (params.enabled) return;

    const waitTime = generateRandomInteger(1, 5);
    setTimeout(() => {
      transmitSwitchTipVisible.value = true;
      setTimeout(() => {
        reloadPage();
      }, 3000);
    }, waitTime * 1000);
  });

  return {
    transmitSwitchTipVisible,
    reloadPage,
  };
};
