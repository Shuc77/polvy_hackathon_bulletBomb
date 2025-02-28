import { computed, ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-反馈
 * */
export const useFeedBack = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();

  /** 反馈 SDK 实例 */
  const feedBackSdk = watchCore.interactReceive.getFeedBack();

  /** 反馈标题 */
  const feedBackTitle = computed(() => translate('interact.feedBack.title'));

  /** 反馈是否显示 */
  const feedBackVisible = ref(false);

  /** 设置反馈是否显示 */
  const setFeedBackVisible = (visible = true) => {
    feedBackVisible.value = visible;
  };

  useEventBusListener(appEvents.interaction.OpenFeedBack, setFeedBackVisible);

  return {
    feedBackSdk,
    feedBackTitle,
    feedBackVisible,
    setFeedBackVisible,
  };
};
