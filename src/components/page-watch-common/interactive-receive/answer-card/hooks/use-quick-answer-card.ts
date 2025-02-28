import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';

import { IarAnswerQuestionTypes } from '@polyv/live-watch-sdk';
import { QuestionData } from '../types/answer-card-types';
import { useQuickAnswerCardEntrance } from './use-answer-card-entrance';
import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

/**
 * @hook 互动-答题卡-快速问答
 */
export const useQuickAnswerCard = () => {
  const { setQuickAnswerCardEntrance, removeQuickAnswerCardEntrance } =
    useQuickAnswerCardEntrance();

  const { getWatchCore } = useGlobalInject();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

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
      toLockFeedDrag('quick-answer-card');
      setQuickAnswerCardEntrance();
    } else {
      toUnlockFeedDrag();
    }

    if (question && question.type) {
      quickAnswerCardType.value = question.type;
    }
  };

  /** 处理提交答题卡 */
  const onSubmitSuccess = () => {
    removeQuickAnswerCardEntrance();
  };

  useEventBusListener(appEvents.interaction.OpenQuickAnswerCard, setQuickAnswerCardVisible);

  onBeforeMount(() => {
    answerCardSdk.on(answerCardSdk.events.STOP_TEST_QUESTION, removeQuickAnswerCardEntrance);
  });

  onBeforeUnmount(() => {
    answerCardSdk.off(answerCardSdk.events.STOP_TEST_QUESTION, removeQuickAnswerCardEntrance);
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
