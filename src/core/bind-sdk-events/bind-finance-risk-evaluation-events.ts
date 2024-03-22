import { FinanceRiskEvaluationEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { useRiskEvaluationResetHook } from '@/components/page-watch-common/interactive-receive/risk-evaluation';

/**
 * 绑定金融风险测评模块事件
 */
export function bindFinanceRiskEvaluationEvents() {
  const watchCore = getWatchCore();

  const { onRiskEvaluationReset } = useRiskEvaluationResetHook();

  // 金融风险测评-重置
  watchCore.financeRiskEvaluation.eventEmitter.on(
    FinanceRiskEvaluationEvents.Reset,
    onRiskEvaluationReset,
  );
}
