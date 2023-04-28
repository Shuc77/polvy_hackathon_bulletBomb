import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';
import { useQuestionnaireEntrance } from './use-questionnaire-entrance';
import { AllQuestionnaireStatus, IarQuestionnaireInstance } from '../types/questionnaire-type';

/**
 * @hook 互动-问卷
 */
export const useQuestionnaire = () => {
  const { setQuestionnaireEntrance, removeQuestionnaireEntrance } = useQuestionnaireEntrance();
  const watchCore = getWatchCore();

  /** 问卷组件节点 */
  const questionnaireRef = ref<IarQuestionnaireInstance>();
  /** 问卷 SDK 实例 */
  const questionnaireSdk = watchCore.interactReceive.getQuestionnaire();
  /** 问卷是否显示 */
  const questionnaireVisible = ref(false);
  /** 问卷状态 */
  const questionnaireStatus = ref<AllQuestionnaireStatus>(AllQuestionnaireStatus.isShowQuestion);

  /** 问卷标题 */
  const questionnaireTitle = computed(() => {
    let title = '';
    switch (questionnaireStatus.value) {
      case AllQuestionnaireStatus.isShowQuestion:
        title = translate('interact.questionnaire.title');
        break;
      case AllQuestionnaireStatus.isShowResult:
      case AllQuestionnaireStatus.isShowAnswer:
        title = translate('interact.questionnaire.result');
        break;
      case AllQuestionnaireStatus.isShowResultRank:
        title = ' ';
        break;
      case AllQuestionnaireStatus.isShowQuestionnaireList:
        title = translate('interact.questionnaire.result.list');
    }
    return title;
  });

  /**
   * 处理问卷状态修改
   * */
  function onStatusChanged(status: AllQuestionnaireStatus) {
    questionnaireStatus.value = status;
  }

  /** 问卷状态副作用处理 */
  function questionnaireStatusEffectHandler() {
    if (!questionnaireRef.value) {
      console.warn('questionnaireRef value is undefined');
      return;
    }

    // 需要直接获取组件内部的问卷状态
    const status = questionnaireRef.value.status;

    if (status === null) {
      // 空状态下需要手动展示问卷列表
      questionnaireRef.value.showList();
      return;
    }

    if (
      status === AllQuestionnaireStatus.isShowQuestion ||
      status === AllQuestionnaireStatus.isShowQuestionnaireList
    ) {
      // 设置互动二次入口
      setQuestionnaireEntrance();
    }
  }

  /** 设置问卷弹窗显示状态 */
  function setQuestionnaireVisible(visible = true) {
    if (visible) {
      questionnaireStatusEffectHandler();
    }

    questionnaireVisible.value = visible;
  }

  /**
   * 处理问卷列表中有无"问卷"的情况
   */
  function onHasQuestionnaire(hasQuestionnaire: boolean) {
    if (hasQuestionnaire) {
      setQuestionnaireEntrance();
    } else {
      removeQuestionnaireEntrance();
    }
  }

  useEventBusListener(appEvents.interaction.OpenQuestionnaire, setQuestionnaireVisible);

  return {
    questionnaireRef,
    questionnaireSdk,
    questionnaireVisible,
    questionnaireTitle,
    questionnaireStatus,
    setQuestionnaireVisible,
    onStatusChanged,
    onHasQuestionnaire,
  };
};
