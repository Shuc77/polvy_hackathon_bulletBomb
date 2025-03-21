import { onBeforeMount, onBeforeUnmount, ref, computed, unref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';

import { AllAnswerCardStatus, IarAnswerCardInstance } from '../types/answer-card-types';
import { useAnswerCardEntrance } from './use-answer-card-entrance';
import { useGlobalInject } from '@/app/use-global-inject';
import { usePlaybackStore } from '@/store/use-playback-store';

/**
 * @hook 互动-答题卡
 */
export const useAnswerCard = () => {
  const { setAnswerCardEntrance, removeAnswerCardEntrance } = useAnswerCardEntrance();

  const playbackStore = usePlaybackStore();

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  /** 答题卡组件节点 */
  const answerCardRef = ref<IarAnswerCardInstance>();
  /** 答题卡 SDK 实例 */
  const answerCardSdk = watchCore.interactReceive.getAnswerCard();
  /** 答题卡是否显示 */
  const answerCardVisible = ref(false);
  /** 答题卡状态 */
  const answerCardStatus = ref(AllAnswerCardStatus.IsShowQuestion);

  /** 答题卡标题 */
  const answerCardTitle = computed(() => {
    let title = '';
    switch (unref(answerCardStatus)) {
      case AllAnswerCardStatus.IsShowQuestion:
        title = translate('interact.answerCard.title');
        break;
      case AllAnswerCardStatus.IsShowResult:
        title = answerCardSdk.curSubmittedAnswer
          ? translate('interact.answerCard.checkResultTitle')
          : translate('interact.answerCard.notSubmitted');
        break;
      case AllAnswerCardStatus.IsShowAnswer:
        title = answerCardSdk.curSubmittedAnswer
          ? translate('interact.answerCard.checkAnswerTitle')
          : translate('interact.answerCard.notSubmitted');
        break;
    }
    return title;
  });

  const serverTimeSyncEnabled = computed(() => {
    return !playbackStore.answerCardReplayEnabled;
  });

  /** 设置答题卡显示状态 */
  const setAnswerCardVisible = (visible = true) => {
    answerCardVisible.value = visible;

    // 显示答题中的状态，设置二次入口
    const answerCardInstance = unref(answerCardRef);
    if (
      visible &&
      answerCardInstance &&
      answerCardInstance.status === AllAnswerCardStatus.IsShowQuestion
    ) {
      setAnswerCardEntrance();
    }
  };

  /** 处理答题卡状态修改 */
  const onStatusChanged = (status: AllAnswerCardStatus) => {
    answerCardStatus.value = status;
  };

  /** 处理提交答题卡 */
  const onSubmitSuccess = () => {
    removeAnswerCardEntrance();
  };

  useEventBusListener(appEvents.interaction.OpenAnswerCard, setAnswerCardVisible);

  onBeforeMount(() => {
    answerCardSdk.on(answerCardSdk.events.STOP_TEST_QUESTION, removeAnswerCardEntrance);
  });

  onBeforeUnmount(() => {
    answerCardSdk.off(answerCardSdk.events.STOP_TEST_QUESTION, removeAnswerCardEntrance);
  });

  return {
    AllAnswerCardStatus,
    answerCardRef,
    answerCardSdk,
    answerCardVisible,
    answerCardTitle,
    answerCardStatus,
    serverTimeSyncEnabled,
    setAnswerCardVisible,
    onStatusChanged,
    onSubmitSuccess,
  };
};
