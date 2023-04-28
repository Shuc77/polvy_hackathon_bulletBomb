import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import {
  SendEmotionImageMsgOptions,
  SendSpeakMsgOptions,
  SendImageMsgOptions,
} from '@polyv/live-watch-sdk';

export const useSendMsg = () => {
  /**
   * 发送 speak 消息
   */
  function sendSpeakMsg(options: SendSpeakMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendSpeakMsg(options, msgResult => {
      eventBus.$emit(appEvents.chat.MsgResultUpdate, msgResult);
    });
    eventBus.$emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送 emotion 图片消息
   */
  async function sendEmotionImageMsg(options: SendEmotionImageMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendEmotionImageMsg(options, msgResult => {
      eventBus.$emit(appEvents.chat.MsgResultUpdate, msgResult);
    });
    eventBus.$emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送 system 系统消息
   */
  function sendSystemMsg(content: string) {
    const watchCore = getWatchCore();
    watchCore.chat.sendSystemMsg(content);
    eventBus.$emit(appEvents.chat.ScrollToNew);
  }

  /**
   * 发送图片
   */
  function sendImageMsg(options: SendImageMsgOptions) {
    const watchCore = getWatchCore();
    watchCore.chat.sendImageMsg(options, msgResult => {
      eventBus.$emit(appEvents.chat.MsgResultUpdate, msgResult);
    });
    eventBus.$emit(appEvents.chat.ScrollToNew);
  }

  return {
    sendSpeakMsg,
    sendEmotionImageMsg,
    sendSystemMsg,
    sendImageMsg,
  };
};
