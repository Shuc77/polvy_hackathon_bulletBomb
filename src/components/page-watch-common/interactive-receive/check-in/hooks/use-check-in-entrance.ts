import { appEvents, eventBus } from '@/app/app-events';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';

// import { useCheckIn } from './use-check-in';

/**
 * @hook 互动-签到入口
 */
export const useCheckInEntrance = () => {
  // const { isOldEntrance } = useCheckIn();
  const interactReceiveStore = useInteractReceiveStore();

  /** 问卷入口数据 */
  const checkInEntranceData: InteractiveEntranceData = {
    type: 'check-in',
    name: 'interact.checkIn.title',
    icon: require('./imgs/icon-check-in.png'),
    icon2: require('./imgs/icon-check-in_p.png'),
    onClick: () => eventBus.$emit(appEvents.interaction.OpenCheckIn, true),
  };

  /** 设置签到二次入口 */
  const setCheckInEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(checkInEntranceData);
  };

  /** 移除签到二次入口 */
  const removeCheckInEntrance = () => {
    // if (isOldEntrance.value) {
    interactReceiveStore.removeInteractiveEntrance(checkInEntranceData.type);
    // }
  };

  return {
    checkInEntranceData,
    setCheckInEntrance,
    removeCheckInEntrance,
  };
};
