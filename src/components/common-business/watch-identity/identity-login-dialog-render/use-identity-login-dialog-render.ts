import { appEvents, useEventBusListener } from '@/app/app-events';
import { translate } from '@/assets/lang';
import { MessageBoxInstance } from '@/components/common-base/message-box';
import { InterruptTriggerSource } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

import { ref } from 'vue';
import { useIdentity } from '../use-identify-ui-global-provider';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useGlobalInject } from '@/app/use-global-inject';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';

export const useIdentityLoginDialogRender = () => {
  const { getLinkParams } = useIarExternalLinkParams();

  const { getEmitter } = useGlobalInject();

  const { getWatchIdentifyCore } = useIdentity();

  const renderEnabled = ref(!isBuildForFeedMainMode());

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

  async function getLinkData() {
    if (isBuildForFeedMainMode()) return null;

    const identifyCore = getWatchIdentifyCore();
    await identifyCore.identity.ensureUserLoginConfig();
    return identifyCore.identity.getIdentifyGuestLinkLoginConfig();
  }

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
      if (isBuildForFeedMainMode()) {
        getEmitter().emit(appEvents.global.OpenExternalIdentityLoginDialog, {
          triggerSource,
          linkParams: getLinkParams(),
        });
        return;
      }

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
    renderEnabled,
    getLinkData,

    messageBoxRef,
    messageBoxContent,

    contentDialogVisible,
    closeContentDialog,
  };
};
