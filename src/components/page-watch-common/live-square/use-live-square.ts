import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { LiveSquare, YN, plvInterval } from '@polyv/live-watch-sdk';
import { ref, computed } from 'vue';
import { navigateToLink, formatLink, type LinkData, LinkJumpWay } from '@utils-ts/external-link';
import { openLink } from '@/assets/utils/url';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWebviewStore } from '@/store/use-webview-store';
import { isMobile } from '@/assets/utils/browser';
import { useWeixinButton } from '@/hooks/platform/use-weixin/use-weixin-button';
import { useChannelInfoStore } from '@/store/use-channel-info-store';

export type LiveSquareLinkConfig = Exclude<LiveSquare, 'enabled' | 'title'>;

function useLiveSquare() {
  /** 直播广场是否开启 */
  const liveSquareEnabled = ref<YN>(YN.N);
  /** 直播广场标题 */
  const liveSquareTitle = ref('');
  /** 直播广场链接配置 */
  const liveSquareLinkConfig = ref<LiveSquareLinkConfig>();

  const { showLiveCountDown } = storeDefinitionToRefs(useChannelInfoStore);

  const showWeixinBtn = ref(false);

  /** 强制页内展示 */
  const forceOpenInMenu = ref(false);
  /** iframe 地址 */
  const iframeUrl = ref('');

  const { getPlvWebviewBridge } = useWebviewStore();
  const { isPlvWebview, plvWebviewDataSize } = storeDefinitionToRefs(useWebviewStore);
  const { getLinkParams } = useIarExternalLinkParams();

  // 微信按钮功能
  const {
    supportWxOpenLaunchWebApp,
    weixinBtnRef,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
  } = useWeixinButton({
    getButtonOptions: () => {
      const linkData = getLinkData();
      if (!linkData) return undefined;

      return {
        wxMiniprogramOriginalId: linkData.wxMiniprogramOriginalId,
        wxMiniprogramLink: formatLink(linkData.wxMiniprogramLink, getLinkParams),
        classKey: 'live-square',
      };
    },
  });

  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();
  const liveSquareConfig = watchCore.channel.getLiveSquareConfig();

  if (liveSquareConfig) {
    liveSquareEnabled.value = liveSquareConfig.enabled;
    liveSquareTitle.value = liveSquareConfig.title;
    liveSquareLinkConfig.value = liveSquareConfig;
  }

  function getLinkData(): LinkData | null {
    if (!liveSquareLinkConfig.value) {
      return null;
    }

    // 普通链接类型
    const data = {
      link: liveSquareLinkConfig.value.link,
      jumpWay: (liveSquareLinkConfig.value.jumpWay as LinkJumpWay) || LinkJumpWay.NewWindow,
      pcLink: liveSquareLinkConfig.value.pcLink,
      mobileAppLink: liveSquareLinkConfig.value.mobileAppLink,
      androidLink: liveSquareLinkConfig.value.androidLink,
      iosLink: liveSquareLinkConfig.value.iosLink,
      harmonyLink: liveSquareLinkConfig.value.harmonyLink,
      wxMiniprogramOriginalId: liveSquareLinkConfig.value.wxMiniprogramOriginalId,
      wxMiniprogramAppId: liveSquareLinkConfig.value.wxMiniprogramAppId,
      wxMiniprogramLink: liveSquareLinkConfig.value.wxMiniprogramLink,
    };

    // 旧数据配置了通用链接，则多平台链接全部失效
    if (liveSquareLinkConfig.value.linkType === '10') {
      data.pcLink = '';
      data.mobileAppLink = '';
      data.androidLink = '';
      data.iosLink = '';
      data.harmonyLink = '';
      data.wxMiniprogramOriginalId = '';
      data.wxMiniprogramAppId = '';
      data.wxMiniprogramLink = '';
    }

    // 旧数据只配置多平台，要把手机端链接放到浏览器链接里使用
    if (liveSquareLinkConfig.value.linkType === '11' && !data.link) {
      data.link = liveSquareLinkConfig.value.mobileLink;
    }

    return data;
  }

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
        forceOpenInMenu.value = true;
        iframeUrl.value = url;
        break;
      case LinkJumpWay.NewWindow:
      default:
        openLink(url);
    }
  }

  function handleMultiPlatformLinkType() {
    try {
      const linkData = getLinkData();
      if (!linkData) {
        console.warn('handleMultiPlatformLinkType: linkData is null');
        return;
      }

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
      console.error('handleMultiPlatformLinkType error:', error);
    }
  }

  function handleGeneralLinkType() {
    if (!liveSquareLinkConfig.value?.link) return;

    const promoteLinkUrl = formatLink(liveSquareLinkConfig.value.link, getLinkParams);
    if (!promoteLinkUrl) return;

    const jumpWay = (liveSquareLinkConfig.value.jumpWay as LinkJumpWay) || LinkJumpWay.NewWindow;
    openJumpWayLink(promoteLinkUrl, jumpWay);
  }

  function handleLiveSquareClick() {
    if (!liveSquareLinkConfig.value) {
      console.warn('handleLiveSquareClick: liveSquareLinkConfig is null');
      return;
    }

    handleMultiPlatformLinkType();
  }

  /** 是否需要在弹窗中打开 */
  const isOpenInPopup = computed(() => {
    return forceOpenInMenu.value;
  });

  /** 重置弹窗状态 */
  function resetPopupState() {
    forceOpenInMenu.value = false;
    iframeUrl.value = '';
  }

  /** 获取微信按钮设置是否启用 */
  const getWeixinBtnSetupEnabled = async () => {
    const linkData = getLinkData();
    if (!linkData) return false;

    const isWxMiniProgramWebview = await checkWxMiniProgramWebview();
    // 小程序 webview 内使用原生 sdk 功能跳转
    if (isWxMiniProgramWebview) {
      return false;
    }

    return supportWxOpenLaunchWebApp.value && !!linkData.wxMiniprogramOriginalId;
  };

  let pollingTimer: ReturnType<typeof plvInterval> | null = null;

  function clearPolling() {
    if (pollingTimer) {
      pollingTimer.clear();
      pollingTimer = null;
    }
  }

  /** 设置微信按钮hack逻辑 */
  async function hackWeixinBtnSetup(weixinBtnSelector?: string) {
    const weixinBtnSetupEnabled = await getWeixinBtnSetupEnabled();
    if (!weixinBtnSetupEnabled || !weixinBtnSelector) return;

    // 延迟一下，确保外部 hack 的占位 dom 节点有加载
    pollingTimer = plvInterval(
      () => {
        const $hackWeixinBtn = document.querySelector(weixinBtnSelector);

        if ($hackWeixinBtn) {
          clearPolling();
          // 设置值的时候，会自动去创建对应的微信开放标签
          weixinBtnRef.value = $hackWeixinBtn as HTMLDivElement;
          showWeixinBtn.value = true;
        }
      },
      100,
      { maxCount: 10 },
    );
  }

  const isShowLiveSquare = computed(() => {
    return (
      liveSquareEnabled.value === YN.Y && !showLiveCountDown.value && liveSquareTitle.value !== ''
    );
  });

  // onMounted(() => {
  //   if (liveSquareLinkConfig.value?.linkType === String(LinkType.MultiPlatform)) {
  //     // 这里可以根据需要传入微信按钮选择器
  //     // hackWeixinBtnSetup('.live-square-weixin-btn');
  //   }
  // });

  return {
    liveSquareEnabled,
    liveSquareTitle,
    liveSquareLinkConfig,
    isShowLiveSquare,
    handleLiveSquareClick,
    handleGeneralLinkType,
    iframeUrl,
    isOpenInPopup,
    resetPopupState,

    // 微信按钮相关
    getWeixinBtnSetupEnabled,
    weixinBtnRef,
    hackWeixinBtnSetup,
    supportWxOpenLaunchWebApp,
    checkWxMiniProgramWebview,
    toWxMiniProgram,
    supportWxMiniProgramNavigateTo,
    showWeixinBtn,
  };
}

export default useLiveSquare;
