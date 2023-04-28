import { FinanceRiskEvaluationSocketData } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { useFinanceStore } from '@/store/use-finance-store';
import { ynToBool } from '@utils-ts/boolean';
import { appEvents, eventBus } from '@/app/app-events';

/**
 * @hooks 风险测评-测评重置
 */
export const useRiskEvaluationResetHook = () => {
  const watchCore = getWatchCore();

  const financeStore = useFinanceStore();

  /**
   * 风险测评-更改测评开关
   */
  function riskEvaluationResetEnableHandler(socketData: FinanceRiskEvaluationSocketData) {
    const riskEvaluation = financeStore.riskEvaluation;

    if (ynToBool(socketData.evaluationEnabled)) {
      // 关 -> 开
      financeStore.syncRiskEvaluation({
        evaluationEnabled: socketData.evaluationEnabled,
      });

      const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation);
      if (isPass) {
        // 原本通过测评，则需要继续处理 socketData 中其他数据
        onRiskEvaluationReset({ socketData });
        return;
      }

      // 没有通过测评，需要判断当前测评时机
      const isAfterLimitType = watchCore.financeRiskEvaluation.judgeIsAfterLimitType(socketData);
      if (isAfterLimitType) {
        financeStore.syncRiskEvaluation({
          evaluationLimitType: socketData.evaluationLimitType,
        });
        return;
      }
      const isPreLimitType = watchCore.financeRiskEvaluation.judgeIsPreLimitType(socketData);
      if (isPreLimitType) {
        eventBus.$emit(appEvents.finance.RiskEvaluationRedirectDialogShow);
      }
    } else {
      // 开 -> 关
      financeStore.syncRiskEvaluation({
        evaluationEnabled: socketData.evaluationEnabled,
      });
    }
  }

  /**
   * 风险测评-更改测评分数标准，只同步更改 riskEvaluation 数据
   */
  function riskEvaluationResetScoreLimitHandler(socketData: FinanceRiskEvaluationSocketData) {
    const riskEvaluation = financeStore.riskEvaluation;
    const isScorePass = riskEvaluation.score >= socketData.scoreLimit;
    financeStore.syncRiskEvaluation({
      scoreLimit: socketData.scoreLimit,
      passEvaluation: isScorePass ? 1 : 0,
    });
  }

  /**
   * 风险测评-更改测评时机
   */
  function riskEvaluationResetLimitTypeHandler(socketData: FinanceRiskEvaluationSocketData) {
    const riskEvaluation = financeStore.riskEvaluation;

    const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation);
    if (isPass) {
      financeStore.syncRiskEvaluation({
        evaluationLimitType: socketData.evaluationLimitType,
      });
      return;
    }

    const { judgeIsPreLimitType, judgeIsAfterLimitType } = watchCore.financeRiskEvaluation;

    // 后置 -> 前置
    const isAfter2Pre = judgeIsAfterLimitType(riskEvaluation) && judgeIsPreLimitType(socketData);
    if (isAfter2Pre) {
      eventBus.$emit(appEvents.finance.RiskEvaluationPendantTimeoutCacheClear);
      eventBus.$emit(appEvents.finance.RiskEvaluationRedirectDialogShow);
      return;
    }

    // 后置 -> 后置
    const isAfter2After =
      judgeIsAfterLimitType(riskEvaluation) && judgeIsAfterLimitType(socketData);
    if (isAfter2After) {
      financeStore.syncRiskEvaluation({
        evaluationLimitType: socketData.evaluationLimitType,
      });
      return;
    }

    // 前置 -> 前置
    const isPre2Pre = judgeIsPreLimitType(riskEvaluation) && judgeIsPreLimitType(socketData);
    if (isPre2Pre) {
      eventBus.$emit(appEvents.finance.RiskEvaluationRedirectDialogShow);
      return;
    }

    // 前置 -> 后置
    const isPre2After = judgeIsPreLimitType(riskEvaluation) && judgeIsAfterLimitType(socketData);
    if (isPre2After) {
      riskEvaluationResetScoreLimitHandler(socketData);
      riskEvaluationMainModalShowByNotPass();
    }
  }

  /**
   * 风险测评-不通过测评时展示"去测评"弹窗
   */
  function riskEvaluationRedirectModalShowByNotPass() {
    const riskEvaluation = financeStore.riskEvaluation;

    const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation);
    if (!isPass) {
      eventBus.$emit(appEvents.finance.RiskEvaluationRedirectDialogShow);
    }
  }

  /**
   * 风险测评-不通过测评时展示测评弹窗
   */
  function riskEvaluationMainModalShowByNotPass() {
    const riskEvaluation = financeStore.riskEvaluation;

    const isPass = watchCore.financeRiskEvaluation.judgeIsPassRiskEvaluation(riskEvaluation);
    if (!isPass) {
      eventBus.$emit(appEvents.finance.RiskEvaluationMainDialogShow);
    }
  }

  /**
   * 处理"风险测评-测评重置"事件钩子
   */
  function onRiskEvaluationReset({
    socketData,
  }: {
    socketData: FinanceRiskEvaluationSocketData;
  }): void {
    const riskEvaluation = financeStore.riskEvaluation;

    // 更改测评开关
    if (socketData.evaluationEnabled !== riskEvaluation.evaluationEnabled) {
      return riskEvaluationResetEnableHandler(socketData);
    }

    // 测评开关开启时才会响应其他更改
    if (ynToBool(riskEvaluation.evaluationEnabled)) {
      // 同时更改：更改测评分数标准 + 更改测评时机
      if (
        socketData.scoreLimit !== riskEvaluation.scoreLimit &&
        socketData.evaluationLimitType !== riskEvaluation.evaluationLimitType
      ) {
        riskEvaluationResetScoreLimitHandler(socketData);
        return riskEvaluationResetLimitTypeHandler(socketData);
      }

      // 只更改测评时机
      if (socketData.evaluationLimitType !== riskEvaluation.evaluationLimitType) {
        return riskEvaluationResetLimitTypeHandler(socketData);
      }

      // 只更改测评分数标准
      if (socketData.scoreLimit !== riskEvaluation.scoreLimit) {
        riskEvaluationResetScoreLimitHandler(socketData);
        // 目前只有前置时机有分数限制，不通过测评的话需要展示"去测评"弹窗
        riskEvaluationRedirectModalShowByNotPass();
      }
    }
  }

  return {
    onRiskEvaluationReset,
  };
};
