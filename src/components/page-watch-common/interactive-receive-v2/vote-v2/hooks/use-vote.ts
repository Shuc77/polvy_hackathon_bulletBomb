import { computed } from 'vue';
import { useGlobalInject } from '@/app/use-global-inject';
import { type PolyvVote } from '@polyv/live-watch-sdk';
import { useIarTarget } from '../../_hooks/use-iar-target';
import { useThemeStore } from '@/store/use-theme-store';

export const useVote = () => {
  const themeStore = useThemeStore();

  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  const { targetInited, getIarTarget } = useIarTarget<PolyvVote.Vote>(() => {
    return watchCore.interactReceive.getVoteV2();
  });

  // 获取投票设置
  const voteSetting = computed(() => {
    return watchCore.interactReceive.getVoteSetting();
  });

  // 获取最大投票数
  const maxVote = computed(() => {
    return voteSetting.value?.maxVote;
  });

  // 获取布局类型，2为double，其他为single
  const layout = computed(() => {
    return voteSetting.value?.layoutType === 2 ? 'double' : 'single';
  });

  // 获取投票规则
  const voteRule = computed(() => {
    return voteSetting.value?.voteRule || '';
  });

  // 获取结果展示类型
  const resultShowType = computed(() => {
    return voteSetting.value?.resultShowType;
  });

  const iconUrl = computed(() => {
    if (!themeStore.watchThemeStyleConfig) return '';

    return themeStore.watchThemeStyleConfig.common.pendant.vote;
  });

  return {
    targetInited,
    getIarTarget,
    maxVote,
    layout,
    voteRule,
    resultShowType,
    iconUrl,
  };
};
