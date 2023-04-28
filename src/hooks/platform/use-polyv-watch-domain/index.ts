/**
 * @file 泛域名 hook
 */

import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { RedirectWatchDomainPayOptions, WatchDomainPayType, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { computed, unref } from 'vue';

/**
 * @hook 泛域名处理
 * */
export const usePolyvWatchDomain = () => {
  const { channelDetail } = storeDefinitionToRefs(useChannelStore);

  /** 泛域名开关 */
  const polyvWatchDomainEnabled = computed<boolean>(() => {
    return ynToBool(unref(channelDetail)?.channelConfig.polyvWatchDomainEnabled, YN.N);
  });

  /**
   * 跳转到泛域名支付 - 仅支持微信支付
   */
  async function skipWatchDomainPay<T extends WatchDomainPayType>(
    options: RedirectWatchDomainPayOptions<T>,
  ) {
    const watchCore = getWatchCore();
    watchCore.weixin.redirectWatchDomainPay(options);
  }

  return {
    polyvWatchDomainEnabled,
    skipWatchDomainPay,
  };
};
