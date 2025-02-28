import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  useInteractReceiveStore,
  InteractiveEntranceData,
} from '@/store/use-interact-receive-store';

/**
 * @hook 互动-答题卡入口
 */
export const useAnswerCardEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  /** 答题卡入口数据 */
  const answerCardEntranceData: InteractiveEntranceData = {
    type: 'answer-card',
    name: 'interact.answerCard.title',
    icon: require('./imgs/icon-answer-card.png'),
    icon2: require('./imgs/icon-answer-card_p.png'),
    onClick: () => getEmitter().emit(appEvents.interaction.OpenAnswerCard, true),
  };

  /** 设置答题卡二次入口 */
  const setAnswerCardEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(answerCardEntranceData);
  };

  /** 移除答题卡二次入口 */
  const removeAnswerCardEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(answerCardEntranceData.type);
  };

  return {
    answerCardEntranceData,
    setAnswerCardEntrance,
    removeAnswerCardEntrance,
  };
};

/**
 * 快速答题卡入口 hooks
 */
export const useQuickAnswerCardEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  /** 快速答题卡入口数据 */
  const quickAnswerCardEntranceData: InteractiveEntranceData = {
    type: 'quick-answer-card',
    name: 'interact.answerCard.title',
    icon: require('./imgs/icon-answer-card.png'),
    icon2: require('./imgs/icon-answer-card_p.png'),
    onClick: () => getEmitter().emit(appEvents.interaction.OpenQuickAnswerCard, true),
  };

  /** 设置快速答题卡二次入口 */
  const setQuickAnswerCardEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(quickAnswerCardEntranceData);
  };

  /** 移除快速答题卡二次入口 */
  const removeQuickAnswerCardEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(quickAnswerCardEntranceData.type);
  };

  return {
    quickAnswerCardEntranceData,
    setQuickAnswerCardEntrance,
    removeQuickAnswerCardEntrance,
  };
};
