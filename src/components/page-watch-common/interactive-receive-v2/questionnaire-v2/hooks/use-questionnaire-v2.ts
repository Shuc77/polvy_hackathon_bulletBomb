import { useGlobalInject } from '@/app/use-global-inject';
import { PolyvIarQuestionnaire } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';

export const useQuestionnaireTarget = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvIarQuestionnaire>(() => {
    return watchCore.interactReceive.getQuestionnaireV2();
  });

  return {
    targetInited,
    getIarTarget,
  };
};
