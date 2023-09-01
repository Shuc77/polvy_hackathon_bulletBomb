import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { previewImage } from '@/hooks/components/use-image-preview';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';

/**
 * @hook 互动-问答
 */
export const useQuestionAnswer = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const viewerStore = useViewerStore();

  const watchCore = getWatchCore();
  const questionAnswerSdk = watchCore.interactReceive.getQuestionAnswer();

  /**
   * 处理设置昵称
   */
  function onSetNick() {
    const checkResult = viewerStore.checkNeedRealNameAuth();
    if (checkResult) {
      return;
    }
    eventBus.$emit(appEvents.chat.OpenSetNick, true);
  }

  const innerHasNickname = computed(() => {
    if (!viewerStore.hasNickname) {
      return false;
    }

    return !viewerStore.needRealNameAuth;
  });

  /**
   * 处理图片浏览
   * @param data
   */
  function onPreviewImage(data: { url: string }) {
    previewImage([data.url]);
  }

  function onTabSwitch(name: string) {
    // 切换到问答 tab，取消红点
    if (name === TAB_NAME_QA) {
      interactReceiveStore.$patch({
        qaReminderVisible: false,
      });
    }
  }

  onMounted(() => {
    eventBus.$on(appEvents.global.PcAsideMenuSwitch, onTabSwitch);
    eventBus.$on(appEvents.global.MobileBottomMenuSwitch, onTabSwitch);
  });

  onBeforeUnmount(() => {
    eventBus.$off(appEvents.global.PcAsideMenuSwitch, onTabSwitch);
    eventBus.$off(appEvents.global.MobileBottomMenuSwitch, onTabSwitch);
  });

  return {
    questionAnswerSdk,
    innerHasNickname,
    onSetNick,
    onPreviewImage,
  };
};
