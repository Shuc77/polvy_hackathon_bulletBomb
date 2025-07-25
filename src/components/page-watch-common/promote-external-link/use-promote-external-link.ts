import { translate } from '@/assets/lang';
import { openLink } from '@/assets/utils/url';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { ChannelMenuIframeOpenType, plvInterval, plvParseJson } from '@polyv/live-watch-sdk';
import { computed, onMounted, ref, watch } from 'vue';
import {
  navigateToLink,
  formatLink,
  type LinkData,
  LinkJumpWay,
  LinkType,
} from '@utils-ts/external-link';
import { useIarExternalLinkParams } from '../interactive-receive/use-iar-external-link-params';
import { useWeixinButton } from '@/hooks/platform/use-weixin/use-weixin-button';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { isMobile } from '@/assets/utils/browser';

export const promoteExternalLinkProps = () => ({
  /** iframe 链接地址或者 json 配置 */
  content: PropUtils.string.def(''),
  /** iframe 打开方式 */
  openType: PropUtils.enum<ChannelMenuIframeOpenType>().def(undefined),
  /** 是否激活 */
  isActive: PropUtils.bool.def(false),
  /** 链接类型 */
  linkType: PropUtils.number.def(),
  /** 微信按钮选择器 */
  weixinBtnSelector: PropUtils.string.def(),
});

export const usePromotionExternalLinkButton = (options: {
  getLinkData: () => LinkData | null;
  popUpJumpHandler: (url: string) => void;
}) => {
  const { getPlvWebviewBridge } = useWebviewStore();
  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);

  const { getLinkParams } = useIarExternalLinkParams();

  const {
    supportWxOpenLaunchWebApp,
    weixinBtnRef,

    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
  } = useWeixinButton({
    getButtonOptions: () => {
      const linkData = options.getLinkData();
      if (!linkData) return undefined;

      return {
        wxMiniprogramOriginalId: linkData.wxMiniprogramOriginalId,
        wxMiniprogramLink: formatLink(linkData.wxMiniprogramLink, getLinkParams),
        classKey: 'promote',
      };
    },
  });

  /**
   * 根据跳转方式打开链接
   * @param url 链接
   * @param jumpWay 跳转方式，默认新窗口打开
   */
  function openJumpWayLink(url: string, jumpWay: LinkJumpWay) {
    switch (jumpWay) {
      case LinkJumpWay.CurrentWindow:
        window.location.href = url;
        break;
      case LinkJumpWay.PopUp:
        options.popUpJumpHandler(url);
        break;
      case LinkJumpWay.NewWindow:
      default:
        openLink(url);
    }
  }

  function handleMultiPlatformLinkType() {
    try {
      const linkData = options.getLinkData();
      if (!linkData) return;

      navigateToLink({
        linkData,
        getLinkParams,
        openLink: openJumpWayLink,
        isMobile: () => isMobile,
        isPlvWebview: () => isPlvWebview.value,
        getPlvWebviewBridge: () => new Promise(resolve => resolve(getPlvWebviewBridge())),
        getPlvWebviewSmallWindowSize: () => plvWebviewDataSize.value,
        isWxMiniProgramEnv: supportWxMiniProgramNavigateTo,
        toWxMiniProgram,
      });
    } catch (error) {
      console.error('handleMultiPlatformLinkType', error);
    }
  }

  const getWeixinBtnSetupEnabled = async () => {
    const linkData = options.getLinkData();
    if (!linkData) return false;

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    // 小程序 webview 内使用原生 sdk 功能跳转
    if (isWxMiniProgramWebview) {
      return false;
    }

    return supportWxOpenLaunchWebApp.value && !!linkData.wxMiniprogramOriginalId;
  };

  return {
    getWeixinBtnSetupEnabled,
    weixinBtnRef,

    handleMultiPlatformLinkType,
  };
};

/**
 * @hook 推广链接组件 Hook
 */
export const usePromoteExternalLinkHook = (options: {
  props: VueProps<typeof promoteExternalLinkProps>;
}) => {
  const { props } = options;

  const { getLinkParams } = useIarExternalLinkParams();

  const tips = computed(() => {
    return translate('promote.external.link.tips');
  });

  /** 强制页内展示 */
  const forceOpenInMenu = ref(false);

  /** iframe 地址 */
  const iframeUrl = ref('');

  function getLinkData() {
    if (props.linkType !== LinkType.MultiPlatform) {
      return null;
    }

    const { success, data } = plvParseJson<LinkData>(props.content);
    if (!success) {
      console.error('getLinkData parse error');
      return null;
    }

    return data;
  }

  const { getWeixinBtnSetupEnabled, weixinBtnRef, handleMultiPlatformLinkType } =
    usePromotionExternalLinkButton({
      getLinkData,
      popUpJumpHandler: url => {
        forceOpenInMenu.value = true;
        iframeUrl.value = url;
      },
    });

  const isOpenInMenu = computed(() => {
    return (
      !props.openType ||
      props.openType === ChannelMenuIframeOpenType.MenuDisplay ||
      forceOpenInMenu.value
    );
  });

  function getPromoteGeneralLinkUrl() {
    if (!props.linkType || props.linkType === LinkType.Normal) {
      return formatLink(props.content, getLinkParams);
    }

    return '';
  }

  function handleGeneralLinkType() {
    const promoteLinkUrl = getPromoteGeneralLinkUrl();
    if (!promoteLinkUrl) return;

    if (isOpenInMenu.value) {
      iframeUrl.value = promoteLinkUrl;
      return;
    }

    if (props.openType === ChannelMenuIframeOpenType.NewPage) {
      openLink(promoteLinkUrl);
      return;
    }

    if (props.openType === ChannelMenuIframeOpenType.CurrentPage) {
      window.location.href = promoteLinkUrl;
    }
  }

  watch(
    () => props.isActive,
    isActive => {
      if (!isActive) return;

      // 处理通用链接
      if (!props.linkType || props.linkType === LinkType.Normal) {
        handleGeneralLinkType();
        return;
      }

      // 处理多平台链接
      if (props.linkType === LinkType.MultiPlatform) {
        handleMultiPlatformLinkType();
      }
    },
    {
      immediate: true,
    },
  );

  let pollingTimer: ReturnType<typeof plvInterval> | null = null;

  function clearPolling() {
    if (pollingTimer) {
      pollingTimer.clear();
      pollingTimer = null;
    }
  }

  async function hackWeixinBtnSetup() {
    const weixinBtnSetupEnabled = await getWeixinBtnSetupEnabled();
    if (!weixinBtnSetupEnabled || !props.weixinBtnSelector) return;

    // 延迟一下，确保外部 hack 的占位 dom 节点有加载
    pollingTimer = plvInterval(
      () => {
        const $hackWeixinBtn = document.querySelector(props.weixinBtnSelector);

        if ($hackWeixinBtn) {
          clearPolling();
          // 设置值的时候，会自动去创建对应的微信开放标签
          weixinBtnRef.value = $hackWeixinBtn as HTMLDivElement;
        }
      },
      100,
      { maxCount: 10 },
    );
  }

  onMounted(() => {
    if (props.linkType === LinkType.MultiPlatform) {
      hackWeixinBtnSetup();
    }
  });

  return {
    tips,

    iframeUrl,
    isOpenInMenu,
  };
};
