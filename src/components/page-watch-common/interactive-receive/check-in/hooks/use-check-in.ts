import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';
import { useCheckInEntrance } from './use-check-in-entrance';
import { useWebviewStore } from '@/store/use-webview-store';

/**
 * @hook 互动-签到
 */
export const useCheckIn = () => {
  const { setCheckInEntrance, removeCheckInEntrance } = useCheckInEntrance();

  const webviewStore = useWebviewStore();

  const watchCore = getWatchCore();
  /** 签到 SDK 实例 */
  const checkInSdk = watchCore.interactReceive.getCheckIn();
  /** 签到是否显示 */
  const checkInVisible = ref(false);
  /** 是否为旧版本聊天室 */
  const isOldEntrance = ref(false);

  /** 互动签到组件实例 */
  const checkInRef = ref();
  /** 签到标题 */
  const checkInTitle = translate('interact.checkIn.title');

  /** 获取签到列表数据  */
  const getCheckInInfo = async function () {
    let data;
    try {
      data = await checkInRef.value.getCheckInInfo();
    } catch (e) {
      // 该方法报错时，说明时私有化聊天室，不支持获取签到列表
      isOldEntrance.value = true;
      // 需要重置标志位
      checkInVisible.value = false;
    }
    return data;
  };

  /** 设置签到是否显示 */
  const setCheckInVisible = async (visible = true, toGetInfo = true) => {
    // to-show 的时候也会去触发这个方法，当标志位一致时就不进入流程
    if (checkInVisible.value === visible && visible === true) return;

    checkInVisible.value = visible;

    if (checkInVisible.value) {
      webviewStore.toLockDrag('portrait-checkIn');
    } else {
      webviewStore.toUnlockDrag();
    }

    if (visible && toGetInfo) {
      await getCheckInInfo();
    }
  };

  const showEntrance = (visible: boolean) => {
    if (visible) {
      setCheckInEntrance();
    }
  };
  /** 兼容旧版聊天室，新逻辑：该频道发起过签到后，入口常驻 */
  const beforeRemoveCheckInEntrance = () => {
    if (isOldEntrance.value) {
      removeCheckInEntrance();
    }
  };

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenCheckIn, setCheckInVisible);
    checkInSdk.on(checkInSdk.events.SIGN_IN, setCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_SUCCESS, beforeRemoveCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_FINISH, beforeRemoveCheckInEntrance);
    checkInSdk.on(checkInSdk.events.STOP_SIGN_IN, beforeRemoveCheckInEntrance);
    checkInSdk.on(checkInSdk.events.SIGN_IN_FAIL, beforeRemoveCheckInEntrance);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenCheckIn, setCheckInVisible);
    checkInSdk.off(checkInSdk.events.SIGN_IN, setCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_SUCCESS, beforeRemoveCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_FINISH, beforeRemoveCheckInEntrance);
    checkInSdk.off(checkInSdk.events.STOP_SIGN_IN, beforeRemoveCheckInEntrance);
    checkInSdk.off(checkInSdk.events.SIGN_IN_FAIL, beforeRemoveCheckInEntrance);
  });

  return {
    checkInSdk,
    checkInVisible,
    checkInTitle,
    setCheckInVisible,
    removeCheckInEntrance,
    checkInRef,
    isOldEntrance,
    showEntrance,
  };
};
