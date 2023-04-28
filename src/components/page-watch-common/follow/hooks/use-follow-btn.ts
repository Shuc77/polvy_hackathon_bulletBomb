import { appEvents, eventBus } from '@/app/app-events';

export const useFollowBtn = () => {
  function onClickFollowBtn() {
    eventBus.$emit(appEvents.global.OpenFollowLayer, true);
  }

  return {
    onClickFollowBtn,
  };
};
