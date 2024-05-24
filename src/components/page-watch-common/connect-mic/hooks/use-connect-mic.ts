import { translate } from '@/assets/lang';
import { toast } from '@/hooks/components/use-toast';
import { getWatchCore } from '@/core/watch-sdk';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { ConnectMicError, ConnectMicEvents } from '@polyv/live-watch-sdk';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { onBeforeUnmount, onMounted } from 'vue';

/**
 * 连麦设备设置 hook
 */
export const useConnectMicDevice = () => {
  /** 开启设备设置 */
  function openDeviceSetting() {
    const watchCore = getWatchCore();
    watchCore.connectMic.openDeviceSetting();
  }

  /** 关闭设备设置 */
  function closeDeviceSetting() {
    const watchCore = getWatchCore();
    watchCore.connectMic.closeDeviceSetting();
  }

  return {
    openDeviceSetting,
    closeDeviceSetting,
  };
};

/**
 * 连麦申请 hook
 */
export const useConnectMicApply = () => {
  const watchCore = getWatchCore();

  /** 申请连麦 */
  async function applyConnectMic() {
    const result = await watchCore.connectMic.applyConnectMic();

    if (!result.success && result.failReason === ConnectMicError.GetDevicePermissionFail) {
      toast.error(translate('connectMic.error.getDeviceFail'));
    }
  }

  /** 取消连麦申请 */
  function cancelApplyConnectMic() {
    watchCore.connectMic.cancelApplyConnectMic();
  }

  return {
    applyConnectMic,
    cancelApplyConnectMic,
  };
};

/**
 * 连麦控制 hook
 */
export const useConnectMicControl = () => {
  const watchCore = getWatchCore();
  const connectMicStore = useConnectMicStore();

  /** 开启摄像头 */
  function enabledVideo() {
    watchCore.connectMic.enabledVideo();
  }

  /** 关闭摄像头 */
  function disabledVideo() {
    watchCore.connectMic.disabledVideo();
  }

  /** 切换摄像头 */
  function toggleVideo() {
    if (connectMicStore.localIsVideoMuted) {
      enabledVideo();
    } else {
      disabledVideo();
    }
  }

  /** 开启麦克风 */
  function enabledAudio() {
    watchCore.connectMic.enabledAudio();
  }

  /** 关闭麦克风 */
  function disabledAudio() {
    watchCore.connectMic.disabledAudio();
  }

  /** 切换麦克风 */
  function toggleAudio() {
    if (connectMicStore.localIsAudioMuted) {
      enabledAudio();
    } else {
      disabledAudio();
    }
  }

  /** 结束连麦 */
  function endConnectMic() {
    watchCore.connectMic.endConnectMic();
  }

  return {
    enabledVideo,
    disabledVideo,
    toggleVideo,
    enabledAudio,
    disabledAudio,
    toggleAudio,
    endConnectMic,
  };
};

/**
 * 连麦总 hook
 * @description 各端仅限注册一次
 */
export const useConnectMic = () => {
  const connectMicStore = useConnectMicStore();

  const { openDeviceSetting } = useConnectMicDevice();
  useEventBusListener(appEvents.connectMic.TriggerOpenDeviceSetting, openDeviceSetting);

  const { applyConnectMic, cancelApplyConnectMic } = useConnectMicApply();
  useEventBusListener(appEvents.connectMic.TriggerApplyConnectMic, applyConnectMic);
  useEventBusListener(appEvents.connectMic.TriggerCancelApplyConnectMic, cancelApplyConnectMic);

  const { endConnectMic } = useConnectMicControl();
  useEventBusListener(appEvents.connectMic.TriggerEndConnectMic, endConnectMic);

  const watchCore = getWatchCore();

  // 邀请上麦
  function onInviteConnectMic() {
    watchCore.connectMic.openInviting();
  }

  function onHandUpMic() {
    toast.info(translate('connectMic.teacherHangUp'));
  }
  onMounted(() => {
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.InviteConnectMic, onInviteConnectMic);
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.TeacherHangUp, onHandUpMic);
    // 当前是被邀请的状态，需要弹出邀请面板
    if (connectMicStore.inviteStatus) {
      onInviteConnectMic();
    }
  });
  onBeforeUnmount(() => {
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.InviteConnectMic, onInviteConnectMic);
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.TeacherHangUp, onHandUpMic);
  });

  // 连麦人数达到限制
  function onOverLimit() {
    toast.error(translate('connectMic.error.overLimit'));
  }
  onMounted(() => {
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.ConnectMicOverLimit, onOverLimit);
  });
  onBeforeUnmount(() => {
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.ConnectMicOverLimit, onOverLimit);
  });

  // 设备采集失败
  function onDeviceRecoverFail() {
    const connectMicStore = useConnectMicStore();
    connectMicStore.$patch({
      isDeviceRecoverFailed: true,
    });
  }
  onMounted(() => {
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.DeviceRecoverFail, onDeviceRecoverFail);
  });
  onBeforeUnmount(() => {
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.DeviceRecoverFail, onDeviceRecoverFail);
  });

  // 主讲设置
  function onSpeaker() {
    if (connectMicStore.currentIsSpeaker) {
      toast.info(translate('connectMic.speaker.receive'));
    } else {
      toast.info(translate('connectMic.speaker.remove'));
    }
  }
  onMounted(() => {
    watchCore.connectMic.eventEmitter.on(ConnectMicEvents.CurrentSpeakerStatusChanged, onSpeaker);
  });
  onBeforeUnmount(() => {
    watchCore.connectMic.eventEmitter.off(ConnectMicEvents.CurrentSpeakerStatusChanged, onSpeaker);
  });
};
