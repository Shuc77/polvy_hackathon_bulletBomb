import { appEvents, useEventBusListener } from '@/app/app-events';
import { computed } from 'vue';

import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { previewImage } from '@/hooks/components/use-image-preview';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-问答
 */
export const useQuestionAnswer = () => {
  const interactReceiveStore = useInteractReceiveStore();
  const viewerStore = useViewerStore();

  const { getEmitter, getWatchCore } = useGlobalInject();

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
    getEmitter().emit(appEvents.chat.OpenSetNick, true);
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

  useEventBusListener(appEvents.global.PcAsideMenuSwitch, onTabSwitch);

  useEventBusListener(appEvents.global.MobileBottomMenuSwitch, onTabSwitch);

  return {
    questionAnswerSdk,
    innerHasNickname,
    onSetNick,
    onPreviewImage,
  };
};
