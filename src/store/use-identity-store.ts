import {
  AuthType,
  IdentitySetting,
  IdentityUnionInfo,
  IdentityDirectAuthParams,
  PlvIdentityModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { computed, ComputedRef, ref, Ref } from 'vue';
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
  /** 绑定用户手机号是否显示 */
  bindMobileVisible: ComputedRef<boolean>;
  /** 是否需要游客强制登录 （游客转正式用户） */
  needIdentityGuestForceLogin: ComputedRef<boolean>;
  /** 当前用户标签 id 列表 */
  currentLabelIds: ComputedRef<number[]>;
  /** 同步 Store 数据 */
  syncIdentityStore(): void;
  /** 当前用户是否是游客 */
  isGuest: Ref<boolean>;
  /** 重置当前用户游客身份 */
  resetGuest(): void;
  /** 检查是否允许使用游客登录 */
  checkAllowUseGuest(): boolean;
  /** 获取独立授权参数 */
  getDirectAuthParams(): IdentityDirectAuthParams;
  /** 允许验证独立授权 */
  allowToVerifyDirectAuth(): boolean;
}

export const useIdentityStore = defineStore<'identity', IdentityStore>('identity', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const authStore = useAuthStore();

  const { paramGetter } = useQueryParams();

  /** 用户系统开关 */
  const watchUserSystemEnabled = ref(false);

  /** 当前用户是否是游客 */
  const isGuest = ref(false);

  /** 用户身份唯一信息 */
  const identityUnionInfo = ref<IdentityUnionInfo>();

  const identitySetting = ref(PlvIdentityModule.generateDefaultIdentitySetting());

  /**
   * 是否是外部用户
   */
  const isExternalUser = computed(() => {
    return !!identityUnionInfo.value?.externalViewerId;
  });

  /**
   * 绑定用户手机号是否显示
   */
  const bindMobileVisible = computed(() => {
    if (!watchUserSystemEnabled.value || !identityUnionInfo.value) {
      return false;
    }

    // 游客和外部用户不显示绑定手机号
    if (isGuest.value || isExternalUser.value) {
      return false;
    }

    return !identityUnionInfo.value.phoneNumber;
  });

  /**
   * 是否需要游客强制登录 （游客登录成正式用户）
   */
  const needIdentityGuestForceLogin = computed(() => {
    return isGuest.value && watchUserSystemEnabled.value;
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

    if (channelStore.isSeminarChannel) {
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

  function getDirectAuthParams(): IdentityDirectAuthParams {
    return {
      externalViewerId: paramGetter().externalViewerId() || '',
      nickname: paramGetter().nickname() || '',
      ts: paramGetter().ts() as unknown as number,
      param4: paramGetter().param4(),
      param5: paramGetter().param5(),
      sign: paramGetter().sign() || '',
      avatar: paramGetter().avatar(),
    };
  }

  function allowToVerifyDirectAuth() {
    const watchCore = watchAppStore.getWatchCore();
    return watchCore.identity.allowToVerifyDirectAuth(getDirectAuthParams());
  }

  return {
    watchUserSystemEnabled,
    isGuest,
    identityUnionInfo,
    identitySetting,
    bindMobileVisible,
    needIdentityGuestForceLogin,
    currentLabelIds,
    syncIdentityStore,
    resetGuest,
    checkAllowUseGuest,
    getDirectAuthParams,
    allowToVerifyDirectAuth,
  };
});
