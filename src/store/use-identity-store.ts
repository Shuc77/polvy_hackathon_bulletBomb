import {
  AuthType,
  IdentitySetting,
  IdentityUnionInfo,
  PlvIdentityModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';
import { useAuthStore } from './use-auth-store';

export interface IdentityStore {
  /** 用户系统开关 */
  watchUserSystemEnabled: Ref<boolean>;
  /** 观众身份唯一信息 */
  identityUnionInfo: Ref<IdentityUnionInfo | undefined>;
  /** 身份设置 */
  identitySetting: Ref<IdentitySetting>;
  /** 绑定手机号是否显示 */
  bindMobileVisible: ComputedRef<boolean>;
  /** 当前用户标签 id 列表 */
  currentLabelIds: ComputedRef<number[]>;
  /** 同步 Store 数据 */
  syncIdentityStore(): void;
  /** 当前用户是否是游客登录 */
  isGuest: Ref<boolean>;
  /** 重置当前用户游客身份 */
  resetGuest(): void;
  /** 检查是否允许使用游客登录 */
  checkAllowUseGuest(): boolean;
}

export const useIdentityStore = defineStore<'identity', IdentityStore>('identity', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const authStore = useAuthStore();

  /** 用户系统开关 */
  const watchUserSystemEnabled = ref(false);

  const isGuest = ref(false);

  /** 用户身份唯一信息 */
  const identityUnionInfo = ref<IdentityUnionInfo>();

  const identitySetting = ref(PlvIdentityModule.generateDefaultIdentitySetting());

  const bindMobileVisible = computed(() => {
    if (!unref(watchUserSystemEnabled)) {
      return false;
    }
    return !unref(identityUnionInfo)?.phoneNumber;
  });

  /**
   * 当前用户标签 id 列表
   */
  const currentLabelIds = computed(() => {
    return (identityUnionInfo.value?.labels || []).map(item => item.id);
  });

  /** 检查是否允许使用游客登录 */
  function checkAllowUseGuest() {
    if (!authStore.hasAuth(AuthType.None)) {
      return false;
    }
    if (channelStore.isPptChannel || channelStore.isSeminarChannel) {
      return false;
    }

    return true;
  }

  function syncIdentityStore() {
    const watchCore = watchAppStore.getWatchCore();

    const setting = watchCore.identity.getIdentitySetting();
    identitySetting.value = setting;
    watchUserSystemEnabled.value = setting.watchUserSystemEnabled;

    identityUnionInfo.value = watchCore.identity.getIdentityUnionInfo();
    isGuest.value = identityUnionInfo.value?.isGuest || false;
  }

  function resetGuest() {
    isGuest.value = false;
  }

  return {
    watchUserSystemEnabled,
    isGuest,
    identityUnionInfo,
    identitySetting,
    bindMobileVisible,
    currentLabelIds,
    syncIdentityStore,
    resetGuest,
    checkAllowUseGuest,
  };
});
