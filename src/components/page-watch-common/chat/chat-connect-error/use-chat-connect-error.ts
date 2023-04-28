import { translate } from '@/assets/lang';
import { useChatStore } from '@/store/use-chat-store';
import { ref, watchEffect } from 'vue';

/**
 * 聊天室连接失败 hook
 */
export const useChatConnectError = () => {
  const chatStore = useChatStore();

  /** 连接失败提示是否显示 */
  const connectErrorVisible = ref(false);

  watchEffect(() => {
    if (chatStore.connectError) {
      connectErrorVisible.value = true;
    } else {
      connectErrorVisible.value = false;
    }
  });

  /** 提示文案 */
  const errorTipsText = translate('chat.connectError');
  const confirmText = translate('base.confirm');
  const cancelText = translate('base.ignore');

  /** 处理确认点击 */
  function onConfirm(): void {
    connectErrorVisible.value = false;
    window.location.reload();
  }

  /** 处理取消点击 */
  function onCancel(): void {
    connectErrorVisible.value = false;
  }

  return {
    connectErrorVisible,
    errorTipsText,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  };
};
