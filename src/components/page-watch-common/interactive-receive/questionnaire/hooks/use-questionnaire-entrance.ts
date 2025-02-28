import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  InteractiveEntranceData,
  useInteractReceiveStore,
} from '@/store/use-interact-receive-store';

/**
 * @hook 问卷入口
 */
export const useQuestionnaireEntrance = () => {
  const { getEmitter } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  /** 问卷入口数据 */
  const questionnaireEntranceData: InteractiveEntranceData = {
    type: 'questionnaire',
    name: 'interact.questionnaire.title',
    icon: require('./imgs/icon-questionnaire.png'),
    icon2: require('./imgs/icon-questionnaire_p.png'),
    onClick: () => getEmitter().emit(appEvents.interaction.OpenQuestionnaire, true),
  };

  /** 设置问卷二次入口 */
  const setQuestionnaireEntrance = () => {
    interactReceiveStore.setInteractiveEntrance(questionnaireEntranceData);
  };

  /** 移除问卷二次入口 */
  const removeQuestionnaireEntrance = () => {
    interactReceiveStore.removeInteractiveEntrance(questionnaireEntranceData.type);
  };

  return {
    questionnaireEntranceData,
    setQuestionnaireEntrance,
    removeQuestionnaireEntrance,
  };
};
