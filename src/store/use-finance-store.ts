import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';

import {
  YN,
  FinanceRiskConfirm,
  FinanceRiskEvaluation,
  FinanceRiskEvaluationLimitType,
} from '@polyv/live-watch-sdk';

import { ynToBool } from '@utils-ts/boolean';
import { getWatchCore } from '@/core/watch-sdk';

/**
 * 获取默认风险测评数据
 * @desc 设置一个默认值来走通流程，默认情况为“后置-自愿填写”
 */
function getDefaultRiskEvaluation(): FinanceRiskEvaluation {
  return {
    evaluationEnabled: YN.N,
    questionnaireId: '1',
    evaluationLimitType: FinanceRiskEvaluationLimitType.Pendant,
    scoreLimit: 0,
    score: -1,
    passEvaluation: 1,
  };
}

/**
 * 获取默认的风险确认函数据
 */
function getDefaultRiskConfirm(): FinanceRiskConfirm {
  return {
    riskConfirmEnabled: YN.N,
    riskConfirmStatus: false,
  };
}

export interface FinanceStoreState {
  /** 风险确认函数据 */
  riskConfirm: Ref<FinanceRiskConfirm>;
  /** 风险确认函开关 */
  riskConfirmEnabled: ComputedRef<boolean>;
  /** 风险测评数据 */
  riskEvaluation: Ref<FinanceRiskEvaluation>;
  /** 风险测评-是否展示引导页 */
  shouldShowSplashByRiskEvaluation: Ref<boolean>;
  /** 风险测评开关 */
  riskEvaluationEnabled: ComputedRef<boolean>;
  /** 风险测评-是否展示挂件入口 */
  riskEvaluationEntranceEnabled: ComputedRef<boolean>;
}

export interface FinanceStoreAction {
  /** 初始化风险确认函数据 */
  initRiskConfirm: () => void;
  /** 同步化风险确认函数据 */
  syncRiskConfirm: (riskEvaluation: Partial<FinanceRiskConfirm>) => void;
  /** 同步风险测评数据 */
  syncRiskEvaluation: (riskEvaluation: Partial<FinanceRiskEvaluation>) => void;
  /** 初始化风险测评数据 */
  initRiskEvaluation: () => void;
}

export interface FinanceStore extends FinanceStoreState, FinanceStoreAction {}

/** @store 金融模块 */
export const useFinanceStore = defineStore<'finance', FinanceStore>('finance', () => {
  /** 风险确认函数据 */
  const riskConfirm = ref(getDefaultRiskConfirm());

  /** 风险确认函开关 */
  const riskConfirmEnabled = computed(() => {
    // 配置开关启用 && 未确认
    return ynToBool(riskConfirm.value.riskConfirmEnabled) && !riskConfirm.value.riskConfirmStatus;
  });

  /** 同步风险测评数据 */
  function syncRiskConfirm(data: Partial<FinanceRiskConfirm>) {
    const originData = riskConfirm.value;
    riskConfirm.value = {
      ...originData,
      ...data,
    };
  }

  /** 初始化风险确认函数据 */
  function initRiskConfirm() {
    const watchCore = getWatchCore();
    const data = watchCore.channel.getChannelDetail().riskConfirm || getDefaultRiskConfirm();

    riskConfirm.value = data;
  }

  /** 风险测评数据 */
  const riskEvaluation = ref(getDefaultRiskEvaluation());

  /** 风险测评-是否展示引导页 */
  const shouldShowSplashByRiskEvaluation = ref(false);

  /** 风险测评开关 */
  const riskEvaluationEnabled = computed(() => {
    return ynToBool(riskEvaluation.value.evaluationEnabled);
  });

  /** 风险测评-是否展示挂件入口 */
  const riskEvaluationEntranceEnabled = computed(() => {
    const watchCore = getWatchCore();

    // 风险测评启用，且为后置条件时，需要展示挂件
    return watchCore.financeRiskEvaluation.judgeNeedShowRiskEvaluationInAfter(riskEvaluation.value);
  });

  /** 同步风险测评数据 */
  function syncRiskEvaluation(data: Partial<FinanceRiskEvaluation>) {
    const originData = riskEvaluation.value;
    riskEvaluation.value = {
      ...originData,
      ...data,
    };
  }

  /** 初始化风险测评数据 */
  function initRiskEvaluation() {
    const watchCore = getWatchCore();

    const data = watchCore.channel.getChannelDetail().riskEvaluation || getDefaultRiskEvaluation();

    riskEvaluation.value = data;
    // 风险测评启用，且为前置条件时，需要强制展示引导页
    shouldShowSplashByRiskEvaluation.value =
      watchCore.financeRiskEvaluation.judgeNeedShowRiskEvaluationInPre(riskEvaluation.value);
  }

  return {
    riskConfirm,
    riskConfirmEnabled,
    riskEvaluation,
    shouldShowSplashByRiskEvaluation,
    riskEvaluationEnabled,
    riskEvaluationEntranceEnabled,

    initRiskConfirm,
    syncRiskConfirm,
    syncRiskEvaluation,
    initRiskEvaluation,
  };
});
