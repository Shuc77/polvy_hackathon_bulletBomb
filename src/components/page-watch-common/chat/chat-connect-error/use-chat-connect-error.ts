import { translate } from '@/assets/lang';
import { useChatStore } from '@/store/use-chat-store';
import { computed, onMounted, ref, watch } from 'vue';

/**
 * 聊天室连接失败 hook
 */
export const useChatConnectError = () => {
  const chatStore = useChatStore();

  /** 连接失败提示是否显示 */
  const connectErrorVisible = ref(false);

  watch(
    () => chatStore.connectError,
    () => {
      connectErrorVisible.value = chatStore.connectError;
    },
  );

  onMounted(() => {
    connectErrorVisible.value = chatStore.connectError;
  });

  /** 提示文案 */
  const errorDialogContentText = computed(() => {
    return translate('chat.connectError.tips1');
  });

  const errorTipsText = computed(() => {
    return translate('chat.connectError.tips2');
  });

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
    errorDialogContentText,
    errorTipsText,
    onConfirm,
    onCancel,
  };
};
