import { computed, unref } from 'vue';
import { useChannelStore } from '@/store/use-channel-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { ynToBool } from '@utils-ts/boolean';
import { YN, WeixinPayType } from '@polyv/live-watch-sdk';

/**
 * @hook 提现
 * */
export const useWithdraw = () => {
  const { channelDetail } = storeDefinitionToRefs(useChannelStore);
  const { weixinAccountFunctionEnabled, weixinPayEnabled } = storeDefinitionToRefs(useWeixinStore);

  /** 提现开关 */
  const withdrawEnabled = computed(() => {
    // 后台开关 - 是否关闭提现
    const backstageSwitch = ynToBool(
      unref(channelDetail)?.channelConfig.closeWithdrawEnabled,
      YN.Y,
    );
    // 超管微信功能开关
    const superSwitch = unref(weixinAccountFunctionEnabled);
    // 超管微信支付开关
    const superPaySwitch = unref(weixinPayEnabled);

    return !backstageSwitch && superSwitch && superPaySwitch;
  });

  /** 微信支付类型 */
  const weixinPayType = computed<WeixinPayType>(() => {
    return channelDetail.value?.channelConfig.weixinPayType ?? WeixinPayType.Enterprise;
  });

  /** 最大提现额度 */
  const freePayAmount = computed(() => {
    return channelDetail.value?.channelConfig.freePayAmount || 0;
  });

  return {
    withdrawEnabled,
    weixinPayType,
    freePayAmount,
  };
};
