import { getWatchCore } from '@/core/watch-sdk';
import { IdentitySetting, IdentityUnionInfo, PlvIdentityModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

export interface IdentityStore {
  /** 用户系统开关 */
  watchUserSystemEnabled: Ref<boolean>;
  /** 观众身份唯一信息 */
  identityUnionInfo: Ref<IdentityUnionInfo | undefined>;
  /** 身份设置 */
  identitySetting: Ref<IdentitySetting>;
  /** 绑定手机号是否显示 */
  bindMobileVisible: ComputedRef<boolean>;
  /** 同步 Store 数据 */
  syncIdentityStore(): void;
}

export const useIdentityStore = defineStore<'identity', IdentityStore>('identity', () => {
  /** 用户系统开关 */
  const watchUserSystemEnabled = ref(false);

  /** 用户身份唯一信息 */
  const identityUnionInfo = ref<IdentityUnionInfo>();

  const identitySetting = ref(PlvIdentityModule.generateDefaultIdentitySetting());

  const bindMobileVisible = computed(() => {
    if (!unref(watchUserSystemEnabled)) {
      return false;
    }
    return !unref(identityUnionInfo)?.phoneNumber;
  });

  function syncIdentityStore() {
    const watchCore = getWatchCore();

    const setting = watchCore.identity.getIdentitySetting();
    identitySetting.value = setting;
    watchUserSystemEnabled.value = setting.watchUserSystemEnabled;

    identityUnionInfo.value = watchCore.identity.getIdentityUnionInfo();
  }

  return {
    watchUserSystemEnabled,
    identityUnionInfo,
    identitySetting,
    bindMobileVisible,
    syncIdentityStore,
  };
});
