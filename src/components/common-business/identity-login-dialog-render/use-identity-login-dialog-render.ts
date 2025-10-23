import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { MessageBoxInstance, MessageBoxPositionType } from '@/components/common-base/message-box';
import { InterruptTriggerSource } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { ref } from 'vue';

export const useIdentityLoginDialogRender = () => {
  const isFeedMainMode = isBuildForFeedMainMode();

  const messageBoxRef = ref<MessageBoxInstance>();

  const messageBoxContent = ref('');

  function setMessageBoxContent(triggerSource: InterruptTriggerSource) {
    const list: Array<InterruptTriggerSource> = [
      'pc-product-pendant',
      'mobile-product-pendant',
      'mobile-product-small-card',
      'pc-product-small-card',
      'product-big-card-popup',
      'coupon-pendant',
      'personal-reward',
    ];

    messageBoxContent.value = list.includes(triggerSource)
      ? translate('auth.login.tips.look')
      : translate('auth.login.tips');
  }

  const positionType = isFeedMainMode
    ? MessageBoxPositionType.Absolute
    : MessageBoxPositionType.Fix;

  const contentDialogVisible = ref(false);

  function openContentDialog() {
    contentDialogVisible.value = true;
  }

  function closeContentDialog() {
    contentDialogVisible.value = false;
  }

  useEventBusListener(
    appEvents.global.OpenIdentityLoginDialog,
    async ({ triggerSource }: { triggerSource: InterruptTriggerSource }) => {
      if (!messageBoxRef.value) return;

      setMessageBoxContent(triggerSource);
      const res = await messageBoxRef.value.$confirm();

      if (res) {
        // @PLV-WARN 此处可以去做一些自定义拦截或者数据同步的操作，默认会打开保利威的用户登录弹窗
        openContentDialog();
      }
    },
  );

  return {
    messageBoxRef,
    messageBoxContent,
    positionType,

    contentDialogVisible,
    closeContentDialog,
  };
};
