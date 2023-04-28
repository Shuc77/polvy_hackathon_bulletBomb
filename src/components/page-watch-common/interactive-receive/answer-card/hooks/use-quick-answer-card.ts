import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';
import { appEvents, eventBus } from '@/app/app-events';

import { translate } from '@/assets/lang';

import { IarAnswerQuestionTypes } from '@polyv/live-watch-sdk';
import { QuestionData } from '../types/answer-card-types';
import { useQuickAnswerCardEntrance } from './use-answer-card-entrance';

/**
 * @hook 互动-答题卡-快速问答
 */
export const useQuickAnswerCard = () => {
  const { setQuickAnswerCardEntrance, removeQuickAnswerCardEntrance } =
    useQuickAnswerCardEntrance();

  const watchCore = getWatchCore();
  /** 答题卡 SDK 实例 */
  const answerCardSdk = watchCore.interactReceive.getAnswerCard();
  /** 快速问答是否显示 */
  const quickAnswerCardVisible = ref(false);
  /** 快速问答类型 */
  const quickAnswerCardType = ref<IarAnswerQuestionTypes>(IarAnswerQuestionTypes.Radio);

  /** 快速问答标题 */
  const quickAnswerCardTitle = computed(() => {
    return quickAnswerCardType.value === IarAnswerQuestionTypes.CheckBox
      ? translate('interact.answerCard.multiChoice')
      : translate('interact.answerCard.singleChoice');
  });

  /** 设置快速问答显示状态 */
  const setQuickAnswerCardVisible = (visible = true, question?: QuestionData) => {
    quickAnswerCardVisible.value = visible;

    // 显示答题中的状态，设置二次入口
    if (visible) {
      setQuickAnswerCardEntrance();
    }

    if (question && question.type) {
      quickAnswerCardType.value = question.type;
    }
  };

  /** 处理提交答题卡 */
  const onSubmitSuccess = () => {
    removeQuickAnswerCardEntrance();
  };

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenQuickAnswerCard, setQuickAnswerCardVisible);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenQuickAnswerCard, setQuickAnswerCardVisible);
  });

  return {
    answerCardSdk,
    quickAnswerCardVisible,
    quickAnswerCardTitle,
    quickAnswerCardType,
    setQuickAnswerCardVisible,
    onSubmitSuccess,
  };
};
