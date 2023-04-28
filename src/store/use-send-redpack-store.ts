import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { ynToBool } from '@utils-ts/boolean';
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useChannelStore } from '@/store/use-channel-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { YN } from '@polyv/live-watch-sdk';

const isGeneralWeixin = isWeixin && !isWorkWeixin;

export interface SendRedpackStoreState {
  /** 是否隐藏"发送红包"功能 */
  sendRedpackHidden: ComputedRef<boolean>;
  /** 是否开启了红包金额、数量限制 */
  redPackCustomAmountEnabled: ComputedRef<boolean>;
  /** 观众发红包最大金额限制 */
  redPackViewerMaxAmount: ComputedRef<number>;
  /** 观众发红包最大数量限制 */
  redPackViewerMaxCount: ComputedRef<number>;
  /** 观众发红包最低均分 */
  redPackViewerMinAverage: Ref<number>;
}

export type SendRedpackStore = SendRedpackStoreState;

export const useSendRedpackStore = defineStore<'sendRedpack', SendRedpackStore>(
  'sendRedpack',
  () => {
    const { channelDetail } = storeDefinitionToRefs(useChannelStore);
    const { weixinPayEnabled, weixinAccountFunctionEnabled } =
      storeDefinitionToRefs(useWeixinStore);

    /** "红包"功能是否在配置层面上可用 */
    const redPackEnabled = computed(() => {
      return (
        ynToBool(channelDetail.value?.channelConfig.redpackEnabled || YN.N) &&
        weixinAccountFunctionEnabled.value
      );
    });

    /** 是否隐藏"发送红包"功能 */
    const sendRedpackHidden = computed(() => {
      return !weixinPayEnabled.value || !isGeneralWeixin || !redPackEnabled.value;
    });

    /** 是否开启了红包金额、数量限制 */
    const redPackCustomAmountEnabled = computed(() =>
      ynToBool(channelDetail.value?.channelConfig.redPackCustomAmountEnabled || 'N'),
    );

    /** 观众发红包最大金额限制 */
    const redPackViewerMaxAmount = computed(
      () => channelDetail.value?.channelConfig.redPackViewerMaxAmount || 300,
    );

    /** 观众发红包最大数量限制 */
    const redPackViewerMaxCount = computed(
      () => channelDetail.value?.channelConfig.redPackViewerMaxCount || 50,
    );

    /** 观众发红包最低均分 */
    const redPackViewerMinAverage = ref(0.3);

    return {
      sendRedpackHidden,
      redPackCustomAmountEnabled,
      redPackViewerMaxAmount,
      redPackViewerMaxCount,
      redPackViewerMinAverage,
    };
  },
);
