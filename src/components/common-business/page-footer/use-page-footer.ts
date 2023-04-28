/**
 * @file 页脚 hook
 */
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ynToBool } from '@utils-ts/boolean';
import { changeProtocol } from '@utils-ts/net';
import { computed, unref } from 'vue';

/** 页脚 hook */
export const usePageFooter = () => {
  const { channelDetail } = storeDefinitionToRefs(useChannelStore);

  /** 页脚设置信息 */
  const footerSetting = computed(() => unref(channelDetail)?.footerSetting);

  /** 页脚是否显示 */
  const footerVisible = computed(() => ynToBool(unref(footerSetting)?.showFooterEnabled || 'N'));

  /** 页脚跳转链接 */
  const footerLink = computed(() => {
    const setting = unref(footerSetting);
    if (!setting) {
      return '';
    }
    const { footTextLinkProtocol, footTextLinkUrl } = setting;
    return changeProtocol(footTextLinkUrl, footTextLinkProtocol);
  });

  /** 页脚文案 */
  const footerText = computed(() => {
    return unref(footerSetting)?.footerText || '';
  });

  return {
    footerSetting,
    footerVisible,
    footerLink,
    footerText,
  };
};
