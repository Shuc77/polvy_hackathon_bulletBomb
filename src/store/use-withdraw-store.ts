import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { isWeixin } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';

export interface WithdrawStoreState {
  /** 是否展示“提现”功能 */
  withdrawVisible: ComputedRef<boolean>;
  /** 最大提现额度 */
  withdrawMaxAmount: Ref<number>;
}

export interface WithdrawStoreAction {
  /** 同步提现 Store */
  syncWithdrawStore: () => void;
}

export interface WithdrawStore extends WithdrawStoreState, WithdrawStoreAction {}

export const useWithdrawStore = defineStore<'withdraw', WithdrawStore>('withdraw', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();

  /** 是否可以提现 */
  const withdrawEnabled = ref(false);

  /** 是否展示“提现”功能 */
  const withdrawVisible = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;
    if (channelStore.isSeminarChannel) return false;

    return isWeixin && withdrawEnabled.value;
  });

  /** 最大提现额度 */
  const withdrawMaxAmount = ref(0);

  /** 同步提现 Store */
  function syncWithdrawStore() {
    const watchCore = getWatchCore();

    const withdrawConfig = watchCore.withdraw.getWithdrawConfig();

    withdrawEnabled.value = withdrawConfig.withdrawEnabled;
    withdrawMaxAmount.value = withdrawConfig.withdrawMaxAmount;
  }

  return {
    withdrawVisible,
    withdrawMaxAmount,
    syncWithdrawStore,
  };
});
