import { translate } from '@/assets/lang';
import { openLink } from '@/assets/utils/url';
import { PropUtils, VueProps } from '@polyv/vue-components';
import { ChannelMenuIframeOpenType, plvInterval, plvParseJson } from '@polyv/live-watch-sdk';
import { computed, onMounted, ref, watch } from 'vue';
import { formatLink, type LinkData, LinkType } from '@utils-ts/external-link';
import { useIarExternalLinkParams } from '../interactive-receive/use-iar-external-link-params';
import { useMultiPlatformLink } from '@/hooks/platform/use-multi-platform-link/use-multi-platform-link';

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
    useMultiPlatformLink({
      getLinkParams,
      getLinkData,
      wxBtnClassKey: 'promote',
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
