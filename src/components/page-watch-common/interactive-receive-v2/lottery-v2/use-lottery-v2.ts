import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvIarLottery } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../_hooks/use-iar-target';
import type { LotteryConfig } from '@polyv/iar-lottery-ui';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { appEvents } from '@/app/app-events';
import { storeToRefs } from 'pinia';
import { useEnrollStore } from '@/store/use-enroll-store';
import { useSendMsg } from '../../chat/chat-msg-list/hooks/send-msg-hook';

export const useLotteryTarget = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const { interactSetting } = storeToRefs(interactReceiveStore);

  const enrollStore = useEnrollStore();

  const { sendSpeakMsg } = useSendMsg();

  const { getWatchCore, getEmitter } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvIarLottery>(() => {
    return watchCore.interactReceive.getLotteryV2();
  });

  const privacyDetail = watchCore.interactReceive.getLotteryPrivacyDetail();
  const lotteryConfig: LotteryConfig = {
    privateContent: privacyDetail.privacyContent,
    animationBtnText: interactSetting.value.lotteryGiftButtonTextCH,
    animationBtnEnText: interactSetting.value.lotteryGiftButtonTextEN,
    detailAutoPopper: interactSetting.value.conditionLotteryAutoPopperEnabled,
    toFillQuestionnaire: questionnaireId => {
      interactReceiveStore.setQuestionnaireBackBtnVisible(false);
      getEmitter().emit(appEvents.interaction.OpenQuestionnaire, questionnaireId);
    },
    beforeJoinLottery: async () => {
      if (enrollStore.needEnrollByChat) {
        getEmitter().emit(appEvents.global.OpenEnrollDialog);
        return false;
      }
      return true;
    },
    customSendComment: options => {
      sendSpeakMsg({
        content: options.comment,
      });

      return Promise.resolve();
    },
  };

  return {
    targetInited,
    getIarTarget,
    lotteryConfig,
  };
};
