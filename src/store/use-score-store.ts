/**
 * @file 积分 store
 */
import { RedpackCurrencyType } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { ComputedRef, computed, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { useDonateStore } from './use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

export interface ScoreStore {
  /** 积分单位 */
  scoreUnit: ComputedRef<string>;
  /** 积分红包是否开启 */
  scoreRedpackEnabled: ComputedRef<boolean>;
}

export const useScoreStore = defineStore<'score', ScoreStore>('score', () => {
  const { channelDetail } = storeDefinitionToRefs(useChannelStore);
  const { donateSetting } = storeDefinitionToRefs(useDonateStore);

  /** 积分单位 */
  const scoreUnit = computed<string>(() => {
    return unref(donateSetting)?.scoreUnit || '';
  });

  /** 积分红包是否开启 */
  const scoreRedpackEnabled = computed(() => {
    const redPackCurrencyType = unref(channelDetail)?.channelConfig.redPackCurrencyType;
    return (
      redPackCurrencyType === RedpackCurrencyType.Score ||
      redPackCurrencyType === RedpackCurrencyType.CashAndScore
    );
  });

  return {
    scoreUnit,
    scoreRedpackEnabled,
  };
});
