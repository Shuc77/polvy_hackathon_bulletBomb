import { ref } from 'vue';
import { isAndroid } from '@/assets/utils/browser';
import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';

export const useKeyboardPulledUp = () => {
  /**
   * 软键盘是否拉起状态
   */
  const isKeyboardPulledUp = ref(false);

  /** 兼容领奖输入框安卓下显示不全问题 */
  let originHeight = document.documentElement.clientHeight || document.body.clientHeight;

  useWindowResizeListener(() => {
    if (!isAndroid) return;

    const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
    if (originHeight < resizeHeight) {
      // Android 键盘收起后操作
      isKeyboardPulledUp.value = false;
    } else {
      // Android 键盘弹起后操作
      isKeyboardPulledUp.value = true;
    }

    originHeight = resizeHeight;
  }, true);

  return {
    isKeyboardPulledUp,
  };
};
