import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';
import { useCheckInEntrance } from './use-check-in-entrance';

/**
 * @hook 互动-签到
 */
export const useCheckIn = () => {
  const { setCheckInEntrance, removeCheckInEntrance } = useCheckInEntrance();

  const watchCore = getWatchCore();
  /** 签到 SDK 实例 */
  const checkInSdk = watchCore.interactReceive.getCheckIn();
  /** 签到是否显示 */
  const checkInVisible = ref(false);
  /** 签到标题 */
  const checkInTitle = translate('interact.checkIn.title');

  /** 设置签到是否显示 */
  const setCheckInVisible = (visible = true) => {
    checkInVisible.value = visible;
  };

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenCheckIn, setCheckInVisible);
    checkInSdk.on(checkInSdk.events.SIGN_IN, setCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_SUCCESS, removeCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_FINISH, removeCheckInEntrance);
    checkInSdk.on(checkInSdk.events.STOP_SIGN_IN, removeCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_FAIL, removeCheckInEntrance);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenCheckIn, setCheckInVisible);
    checkInSdk.off(checkInSdk.events.SIGN_IN, setCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_SUCCESS, removeCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_FINISH, removeCheckInEntrance);
    checkInSdk.off(checkInSdk.events.STOP_SIGN_IN, removeCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_FAIL, removeCheckInEntrance);
  });

  return {
    checkInSdk,
    checkInVisible,
    checkInTitle,
    setCheckInVisible,
    removeCheckInEntrance,
  };
};
