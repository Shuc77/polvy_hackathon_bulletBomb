import { computed, ref, reactive, watchEffect } from 'vue';
import { getWatchCore } from '@/core/watch-sdk';
import { FinanceRiskConfirmAgreement, FinanceRiskConfirmInfo } from '@polyv/live-watch-sdk';
import { isMobile } from '@/assets/utils/browser';
import { toast } from '@/hooks/components/use-toast';
import { useFinanceStore } from '@/store/use-finance-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

export enum RiskConfirmLetterRenderMode {
  /** 默认展示 */
  DEFAULT = 'default',
  /** 预览协议 */
  PREVIEW_AGREEMENT = 'previewAgreement',
  /** "不同意"的提示 */
  DISAGREE_TIPS = 'disagreeTips',
}

enum RiskConfirmAgreeStatus {
  DEFAULT = 0,
  AGREE = 1,
  DISAGREE = 2,
}

export const useRiskConfirmLetterHook = () => {
  const watchAppStore = useWatchAppStore();
  const financeStore = useFinanceStore();

  const dialogVisible = ref(false);

  /** 风险确认同意状态 */
  const riskConfirmAgreeStatus = ref(RiskConfirmAgreeStatus.DEFAULT);

  /** 观众风险确认信息 */
  const viewerRiskConfirmInfo = ref<FinanceRiskConfirmInfo | null>(null);

  /** 当前预览的协议 */
  const curPreviewAgreement = reactive({
    title: '',
    src: '',
  });

  /** 风险确认函-渲染模式 */
  const riskConfirmLetterRenderMode = computed(() => {
    if (curPreviewAgreement.src) {
      return RiskConfirmLetterRenderMode.PREVIEW_AGREEMENT;
    }

    if (riskConfirmAgreeStatus.value === RiskConfirmAgreeStatus.DISAGREE) {
      return RiskConfirmLetterRenderMode.DISAGREE_TIPS;
    }

    return RiskConfirmLetterRenderMode.DEFAULT;
  });

  const contentWrapperStyle = computed(() => {
    if (riskConfirmLetterRenderMode.value === RiskConfirmLetterRenderMode.PREVIEW_AGREEMENT) {
      return {
        minHeight: '400px',
      };
    }
    return {
      minHeight: '212px',
      maxHeight: '212px',
    };
  });

  /** 预览协议 */
  function handlePreviewAgreement(agreement: FinanceRiskConfirmAgreement) {
    if (!viewerRiskConfirmInfo.value) return;

    const watchCore = getWatchCore();
    const previewAgreementUrl = watchCore.financeRiskConfirm.getRiskConfirmAgreementContentUrl({
      agreement,
      isMobile: isMobile,
    });

    curPreviewAgreement.title = agreement.agreementTitle;
    curPreviewAgreement.src = previewAgreementUrl;
  }

  /** 预览默认协议 */
  function handlePreviewDefaultAgreement(title: '服务协议' | '隐私协议') {
    if (!viewerRiskConfirmInfo.value) return;

    const defaultAgreement = viewerRiskConfirmInfo.value.defaultAgreements.find(
      agreement => agreement.agreementTitle === title,
    );

    if (!defaultAgreement) {
      console.error(`找不到《${title}》对应的协议内容`);
      return;
    }

    handlePreviewAgreement(defaultAgreement);
  }

  /** 不同意 */
  function handleDisagreeRiskConfirm() {
    riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.DISAGREE;
  }

  /** 同意确认 */
  async function handleAgreeRiskConfirm() {
    const watchCore = getWatchCore();
    const result = await watchCore.financeRiskConfirm.agreeRiskConfirm();

    if (result.success) {
      dialogVisible.value = false;
      riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.AGREE;

      financeStore.syncRiskConfirm({
        riskConfirmStatus: true,
      });
      watchAppStore.recoverConnectLiveWatch();
    } else {
      console.error(result.failMessage);
      toast.error('同意失败');
    }
  }

  /** 重置风险确认函渲染模式 */
  function resetRiskConfirmLetterRenderMode() {
    curPreviewAgreement.title = '';
    curPreviewAgreement.src = '';

    riskConfirmAgreeStatus.value = RiskConfirmAgreeStatus.DEFAULT;
  }

  /**
   * 初始化观众风险确认信息
   * @desc 需要在获取到观众信息后才能正常使用
   * */
  async function initViewerRiskConfirmInfo() {
    const watchCore = getWatchCore();
    const result = await watchCore.financeRiskConfirm.getViewerRiskConfirmInfo();
    if (!result.success) {
      console.error(result.failMessage);
      toast.error('获取观众风险确认函信息失败');
      return;
    }

    viewerRiskConfirmInfo.value = result;
  }

  // 副作用监听
  const stopWatchEffect = watchEffect(async () => {
    if (!financeStore.riskConfirmEnabled) return;
    if (watchAppStore.shouldShowSplash) return;
    if (!watchAppStore.liveWatchInited) return;

    await initViewerRiskConfirmInfo();
    dialogVisible.value = true;
    stopWatchEffect();
  });

  return {
    dialogVisible,
    viewerRiskConfirmInfo,
    curPreviewAgreement,

    riskConfirmLetterRenderMode,
    contentWrapperStyle,

    resetRiskConfirmLetterRenderMode,
    handlePreviewAgreement,
    handlePreviewDefaultAgreement,
    handleAgreeRiskConfirm,
    handleDisagreeRiskConfirm,
  };
};
