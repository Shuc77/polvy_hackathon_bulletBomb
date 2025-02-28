import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';

/**
 * @hook 互动-签到入口
 */
export const useCheckInEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  /** 签到入口数据 */
  const checkInEntranceData: InteractiveEntranceData = {
    type: 'check-in',
    name: 'interact.checkIn.title',
    icon: require('../images/icon-check-in.png'),
    icon2: require('../images/icon-check-in_p.png'),
    onClick: () => getEmitter().emit(appEvents.interaction.OpenCheckIn, true),
  };

  /** 设置签到二次入口 */
  const setCheckInEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(checkInEntranceData);
  };

  /** 移除签到二次入口 */
  const removeCheckInEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(checkInEntranceData.type);
  };

  return {
    checkInEntranceData,
    setCheckInEntrance,
    removeCheckInEntrance,
  };
};
