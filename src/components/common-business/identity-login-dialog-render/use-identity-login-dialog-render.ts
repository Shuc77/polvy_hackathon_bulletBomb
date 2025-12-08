import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { translate } from '@/assets/lang';
import { openLink } from '@/assets/utils/url';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { MessageBoxInstance, MessageBoxPositionType } from '@/components/common-base/message-box';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { InterruptTriggerSource } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import {
  useMultiPlatformLink,
  useMultiPlatformLinkHelper,
} from '@/hooks/platform/use-multi-platform-link/use-multi-platform-link';
import { LinkData } from '@utils-ts/external-link';
import { ref } from 'vue';

export const useIdentityLoginDialogRender = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

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

  const weixinBtnSelectorId = ref('plv-hack-weixin-guest-login-trigger');

  const { getLinkParams } = useIarExternalLinkParams();

  const linkData = ref<LinkData | null>(null);

  function getLinkData() {
    if (!linkData.value) {
      return null;
    }
    return linkData.value;
  }

  const {
    getWeixinBtnSetupEnabled,
    weixinBtnRef,

    handleMultiPlatformLinkType,
  } = useMultiPlatformLink({
    getLinkParams,
    getLinkData,
    popUpJumpHandler: url => {
      // 暂不支持半弹窗展示
      openLink(url);
    },
    wxBtnClassKey: 'identify-guest',
  });

  const { hackWeixinBtnSetup } = useMultiPlatformLinkHelper({
    getWeixinBtnSetupEnabled,
    setWeixinBtnRef: el => {
      weixinBtnRef.value = el;
    },
    weixinBtnSelector: `#${weixinBtnSelectorId.value}`,
  });

  /**
   * 处理外链跳转
   */
  function processExternalLinkRedirect() {
    if (!linkData.value) {
      return;
    }

    // 多平台
    handleMultiPlatformLinkType();
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
      if (!messageBoxRef.value) return;

      setMessageBoxContent(triggerSource);

      setTimeout(() => {
        // 需要在元素可见的时候，才能去创建多平台的微信按钮，所以此处需要延迟异步调用
        toHackMultiPlatformBtn();
      }, 10);
      const res = await messageBoxRef.value.$confirm();

      if (res) {
        // 处理外链跳转
        if (linkData.value) {
          processExternalLinkRedirect();
          return;
        }

        // @PLV-WARN 此处可以去做一些自定义拦截或者数据同步的操作，默认会打开保利威的用户登录弹窗
        openContentDialog();
      }
    },
  );

  /**
   * 等游客授权完成后再处理游客外链登录配置
   */
  function setupLinkData() {
    const guestLoginLinkConfig = watchCore.identity.getIdentifyGuestLinkLoginConfig();

    if (!guestLoginLinkConfig) return;

    linkData.value = guestLoginLinkConfig;
  }

  function toHackMultiPlatformBtn() {
    if (!linkData.value) return;

    if (weixinBtnRef.value) return;

    hackWeixinBtnSetup();
  }

  return {
    linkData,
    setupLinkData,
    weixinBtnSelectorId,

    messageBoxRef,
    messageBoxContent,
    positionType,

    contentDialogVisible,
    closeContentDialog,
  };
};
