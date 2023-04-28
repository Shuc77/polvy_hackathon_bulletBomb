import { onBeforeMount, onBeforeUnmount, ref, computed, unref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';

import { AllAnswerCardStatus, IarAnswerCardInstance } from '../types/answer-card-types';
import { useAnswerCardEntrance } from './use-answer-card-entrance';

/**
 * @hook 互动-答题卡
 */
export const useAnswerCard = () => {
  const { setAnswerCardEntrance, removeAnswerCardEntrance } = useAnswerCardEntrance();

  const watchCore = getWatchCore();
  /** 答题卡组件节点 */
  const answerCardRef = ref<IarAnswerCardInstance>();
  /** 答题卡 SDK 实例 */
  const answerCardSdk = watchCore.interactReceive.getAnswerCard();
  /** 答题卡是否显示 */
  const answerCardVisible = ref(false);
  /** 答题卡状态 */
  const answerCardStatus = ref(AllAnswerCardStatus.isShowQuestion);

  /** 答题卡标题 */
  const answerCardTitle = computed(() => {
    let title = '';
    switch (unref(answerCardStatus)) {
      case AllAnswerCardStatus.isShowQuestion:
        title = translate('interact.answerCard.title');
        break;
      case AllAnswerCardStatus.isShowResult:
        title = answerCardSdk.curSubmittedAnswer
          ? translate('interact.answerCard.checkResultTitle')
          : translate('interact.answerCard.notSubmitted');
        break;
      case AllAnswerCardStatus.isShowAnswer:
        title = answerCardSdk.curSubmittedAnswer
          ? translate('interact.answerCard.checkAnswerTitle')
          : translate('interact.answerCard.notSubmitted');
        break;
    }
    return title;
  });

  /** 设置答题卡显示状态 */
  const setAnswerCardVisible = (visible = true) => {
    answerCardVisible.value = visible;

    // 显示答题中的状态，设置二次入口
    const answerCardInstance = unref(answerCardRef);
    if (
      visible &&
      answerCardInstance &&
      answerCardInstance.status === AllAnswerCardStatus.isShowQuestion
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

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenAnswerCard, setAnswerCardVisible);
    answerCardSdk.on(answerCardSdk.events.STOP_TEST_QUESTION, removeAnswerCardEntrance);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenAnswerCard, setAnswerCardVisible);
    answerCardSdk.off(answerCardSdk.events.STOP_TEST_QUESTION, removeAnswerCardEntrance);
  });

  return {
    AllAnswerCardStatus,
    answerCardRef,
    answerCardSdk,
    answerCardVisible,
    answerCardTitle,
    answerCardStatus,
    setAnswerCardVisible,
    onStatusChanged,
    onSubmitSuccess,
  };
};
