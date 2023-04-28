import { onBeforeUnmount, onMounted } from 'vue';
import { appEvents, eventBus } from '@/app/app-events';
import { getWatchCore } from '@/core/watch-sdk';

import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { TAB_NAME_QA } from '@/assets/constants/tab-name';
import { previewImage } from '@/hooks/components/use-image-preview';

/**
 * @hook 互动-问答
 */
export const useQuestionAnswer = () => {
  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  const questionAnswerSdk = watchCore.interactReceive.getQuestionAnswer();

  /**
   * 处理设置昵称
   */
  function onSetNick() {
    eventBus.$emit(appEvents.chat.OpenSetNick, true);
  }

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
      interactReceiveStore.qaReminderVisible = false;
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
    onSetNick,
    onPreviewImage,
  };
};
