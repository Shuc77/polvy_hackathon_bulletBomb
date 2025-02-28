import { computed, ref, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import { useQuestionnaireEntrance } from './use-questionnaire-entrance';
import { AllQuestionnaireStatus, IarQuestionnaireInstance } from '../types/questionnaire-type';
import { useGlobalInject } from '@/app/use-global-inject';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

/**
 * @hook 互动-问卷
 */
export const useQuestionnaire = () => {
  const { setQuestionnaireEntrance, removeQuestionnaireEntrance } = useQuestionnaireEntrance();

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const interactReceiveStore = useInteractReceiveStore();

  /** 问卷组件节点 */
  const questionnaireRef = ref<IarQuestionnaireInstance>();
  /** 问卷 SDK 实例 */
  const questionnaireSdk = watchCore.interactReceive.getQuestionnaire();
  /** 问卷是否显示 */
  const questionnaireVisible = ref(false);
  /** 问卷状态 */
  const questionnaireStatus = ref<AllQuestionnaireStatus>(AllQuestionnaireStatus.IsShowQuestion);
  /** 当前抽奖问卷ID */
  const lotteryQuestionnaireId = ref('');

  /** 问卷标题 */
  const questionnaireTitle = computed(() => {
    let title = '';
    switch (questionnaireStatus.value) {
      case AllQuestionnaireStatus.IsShowQuestion:
        title = translate('interact.questionnaire.title');
        break;
      case AllQuestionnaireStatus.IsShowResult:
      case AllQuestionnaireStatus.IsShowAnswer:
        title = translate('interact.questionnaire.result');
        break;
      case AllQuestionnaireStatus.IsShowResultRank:
        title = ' ';
        break;
      case AllQuestionnaireStatus.IsShowQuestionnaireList:
        title = translate('interact.questionnaire.result.list');
    }
    return title;
  });

  /** 问卷返回按钮  */
  const questionnaireBackBtnVisible = computed(() => {
    return interactReceiveStore.questionnaireBackBtnVisible;
  });

  watch(
    () => questionnaireVisible.value,
    val => {
      if (!val) {
        interactReceiveStore.$patch({
          questionnaireBackBtnVisible: true,
        });
        lotteryQuestionnaireId.value = '';
      }
    },
  );

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
      (status === AllQuestionnaireStatus.IsShowQuestion ||
        status === AllQuestionnaireStatus.IsShowQuestionnaireList) &&
      !lotteryQuestionnaireId.value
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

  /**
   * 根据问卷ID显示对应问卷弹窗
   */
  function showQuestionnaireById(questionnaireId: string) {
    lotteryQuestionnaireId.value = questionnaireId;

    if (!questionnaireRef.value) {
      console.warn('questionnaireRef value is undefined');
      return;
    }

    questionnaireRef.value.showOneQuestionnaire(questionnaireId);
  }

  useEventBusListener(appEvents.interaction.OpenQuestionnaire, (questionnaireId?: string) => {
    if (typeof questionnaireId === 'string') {
      showQuestionnaireById(questionnaireId);
      return;
    }
    setQuestionnaireVisible();
  });

  return {
    questionnaireRef,
    questionnaireSdk,
    questionnaireVisible,
    questionnaireTitle,
    questionnaireStatus,
    setQuestionnaireVisible,
    onStatusChanged,
    onHasQuestionnaire,
    showQuestionnaireById,
    questionnaireBackBtnVisible,
  };
};
