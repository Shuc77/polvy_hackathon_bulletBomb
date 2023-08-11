import { appEvents, eventBus } from '@/app/app-events';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';

export const useFollowBtn = () => {
  const { trackUserClickFollowBtn } = useWatchEventTrack();

  function onClickFollowBtn() {
    trackUserClickFollowBtn();
    eventBus.$emit(appEvents.global.OpenFollowLayer, true);
  }

  return {
    onClickFollowBtn,
  };
};
