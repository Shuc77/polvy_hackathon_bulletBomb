import { translate } from '@/assets/lang';
import { openLink } from '@/assets/utils/url';
import { PropUtils, VueProps } from '@/assets/utils/vue-utils/props-utils';
import { ChannelMenuIframeOpenType } from '@polyv/live-watch-sdk';
import { computed, watch } from 'vue';

export const promoteExternalLinkProps = () => ({
  /** iframe 链接地址 */
  src: PropUtils.string.def(''),
  /** iframe 打开方式 */
  openType: PropUtils.enum<ChannelMenuIframeOpenType>().def(undefined),
  /** 是否激活 */
  isActive: PropUtils.bool.def(false),
});

/**
 * @hook 推广链接组件 Hook
 */
export const usePromoteExternalLinkHook = (options: {
  props: VueProps<typeof promoteExternalLinkProps>;
}) => {
  const { props } = options;

  const tips = computed(() => {
    return translate('promote.external.link.tips');
  });

  const isOpenInMenu = computed(() => {
    return !props.openType || props.openType === ChannelMenuIframeOpenType.MenuDisplay;
  });

  const isOpenInNewPage = computed(() => {
    return props.openType === ChannelMenuIframeOpenType.NewPage;
  });

  const isOpenInCurrentPage = computed(() => {
    return props.openType === ChannelMenuIframeOpenType.CurrentPage;
  });

  watch(
    () => props.isActive,
    isActive => {
      if (!isActive || !props.src) return;

      if (isOpenInNewPage.value) {
        openLink(props.src);
        return;
      }

      if (isOpenInCurrentPage.value) {
        window.location.href = props.src;
      }
    },
    {
      immediate: true,
    },
  );

  return {
    tips,
    isOpenInMenu,
    isOpenInNewPage,
    isOpenInCurrentPage,
  };
};
