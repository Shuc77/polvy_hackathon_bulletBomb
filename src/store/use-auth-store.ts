import { AuthInfoItem, AuthSettingItem, AuthSettingItemMap, AuthType } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, unref } from 'vue';
import { useChannelStore } from './use-channel-store';

export interface AuthStoreState {
  /** 观看条件列表 */
  authSettings: ComputedRef<AuthSettingItem[]>;
  /** 观看条件数量 */
  authSettingLength: ComputedRef<number>;
  /** 是否只有一个观看条件 */
  onlyOneAuth: ComputedRef<boolean>;
  /** 观看条件按钮列表 */
  authButtonList: ComputedRef<AuthSettingItem[]>;
  /** 登记观看表单设置 */
  authInfoFields: ComputedRef<AuthInfoItem[]>;
  /** 是否已进行观看条件授权 */
  isAuthorized: ComputedRef<boolean>;
}

export interface AuthStoreActions {
  /** 是否存在某个观看条件 */
  hasAuth(authType: AuthType): boolean;
  /** 获取某个观看条件 */
  getAuthSettingItem: <T extends AuthType>(authType: T) => AuthSettingItemMap<T> | undefined;
}

export interface AuthStore extends AuthStoreState, AuthStoreActions {}

/** 观看条件 store */
export const useAuthStore = defineStore<'auth', AuthStore>('auth', () => {
  const channelStore = useChannelStore();

  /** 观看条件列表 */
  const authSettings = computed<AuthSettingItem[]>(() => {
    return channelStore.channelDetail?.authSetting?.authSettings ?? [];
  });

  /** 观看条件数量 */
  const authSettingLength = computed<number>(() => {
    return unref(authSettings).length;
  });

  /** 是否只有一个观看条件 */
  const onlyOneAuth = computed<boolean>(() => {
    return unref(authSettingLength) === 1;
  });

  /** 观看条件按钮列表 */
  const authButtonList = computed<AuthSettingItem[]>(() => {
    return unref(authSettings).filter(authItem => {
      return authItem.authType !== AuthType.Direct;
    });
  });

  /** 登记观看表单设置 */
  const authInfoFields = computed<AuthInfoItem[]>(() => {
    return channelStore.channelDetail?.authSetting?.authInfoFields ?? [];
  });

  /** 是否已进行观看条件授权 */
  const isAuthorized = computed<boolean>(() => {
    return !!channelStore.channelDetail?.viewerInfo;
  });

  /** 是否存在某个观看条件 */
  function hasAuth(authType: AuthType): boolean {
    return unref(authSettings).findIndex(authItem => authItem.authType === authType) !== -1;
  }

  /** 获取某个观看条件 */
  function getAuthSettingItem<T extends AuthType>(authType: T): AuthSettingItemMap<T> | undefined {
    return unref(authSettings).find(authItem => authItem.authType === authType) as
      | AuthSettingItemMap<T>
      | undefined;
  }

  return {
    authSettings,
    authSettingLength,
    onlyOneAuth,
    authButtonList,
    authInfoFields,
    isAuthorized,
    hasAuth,
    getAuthSettingItem,
  };
});
