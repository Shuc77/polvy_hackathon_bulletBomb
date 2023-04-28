import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { translate } from '@/assets/lang';

/**
 * @hook 互动-反馈
 * */
export const useFeedBack = () => {
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

  onBeforeMount(() => {
    eventBus.$on(appEvents.interaction.OpenFeedBack, setFeedBackVisible);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.interaction.OpenFeedBack, setFeedBackVisible);
  });

  return {
    feedBackSdk,
    feedBackTitle,
    feedBackVisible,
    setFeedBackVisible,
  };
};
