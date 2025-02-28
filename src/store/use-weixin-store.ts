/**
 * @file 微信 store
 */
import { isWeixin } from '@/assets/utils/browser';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { PlvWeixinModule, WeixinPayType, WxShareInfo, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';

export interface WeixinStoreState {
  /** 是否使用微信 SDK 功能 */
  wxSdkFeatureEnabled: Ref<boolean>;
  /** 是否进入微信快照页模式 */
  isWeixinSnapshotPageMode: Ref<boolean>;
  /** 是否已进行微信授权 */
  weixinAuthorized: Ref<boolean>;
  /** 是否已进行微信非静默授权 */
  weixinWatchAuthorized: Ref<boolean>;
  /** 是否已进行企业微信授权 */
  workWeixinAuthorized: Ref<boolean>;
  /** 微信分享信息 */
  wxShareInfo: Ref<WxShareInfo>;
  /** 微信支付类型 */
  weixinPayType: Ref<WeixinPayType>;
  /** 是否可以在微信中重新设置昵称 */
  weixinResetNickEnabled: Ref<boolean>;
}

export interface WeixinStoreAction {
  syncWeixinStore: () => void;
  /** 保存微信分享信息 */
  saveWxShareInfo: (info: WxShareInfo) => void;
}

export interface WeixinStore extends WeixinStoreState, WeixinStoreAction {}

export const useWeixinStore = defineStore<'weixin', WeixinStore>('weixin', () => {
  const watchAppStore = useWatchAppStore();

  const { paramGetter } = useQueryParams();

  /** 是否使用微信 SDK 功能 */
  const wxSdkFeatureEnabled = ref(ynToBool(paramGetter().wxSdkFeatureEnabled(), YN.Y));

  /** 是否进入微信快照页模式 */
  const isWeixinSnapshotPageMode = ref(false);

  /** 是否已进行微信授权 */
  const weixinAuthorized = ref(false);

  /** 是否已进行微信非静默授权 */
  const weixinWatchAuthorized = ref(false);

  /** 是否已进行企业微信授权 */
  const workWeixinAuthorized = ref(false);

  /** 微信分享信息 */
  const wxShareInfo = ref<WxShareInfo>({
    isUseWxShareUrl: YN.N,
    wxShareUrl: '',
    weixinShareCoverImg: '',
    shareTitle: '',
    shareDesc: '',
  });

  /** 保存微信分享信息 */
  function saveWxShareInfo(info: WxShareInfo): void {
    wxShareInfo.value = info;
  }

  const __weixinConfig = PlvWeixinModule.generateDefaultWeixinConfig();

  /** 微信支付类型 */
  const weixinPayType = ref<WeixinPayType>(__weixinConfig.weixinPayType);

  /** 是否可以在微信中重新设置昵称 */
  const weixinResetNickEnabled = ref(__weixinConfig.weixinResetNickEnabled);

  function syncWeixinStore() {
    const watchCore = watchAppStore.getWatchCore();

    isWeixinSnapshotPageMode.value = isWeixin && watchCore.weixin.isWeixinSnapshotPageMode();
    weixinAuthorized.value = watchCore.weixin.isWeixinAuthorized();
    weixinWatchAuthorized.value = watchCore.weixin.isWeixinWatchAuthorized();
    workWeixinAuthorized.value = watchCore.weixin.isWorkWeixinAuthorized();

    const weixinConfig = watchCore.weixin.getWeixinConfig();
    weixinPayType.value = weixinConfig.weixinPayType;
    weixinResetNickEnabled.value = weixinConfig.weixinResetNickEnabled;
  }

  return {
    wxSdkFeatureEnabled,
    isWeixinSnapshotPageMode,
    weixinAuthorized,
    weixinWatchAuthorized,
    workWeixinAuthorized,
    wxShareInfo,
    weixinPayType,
    weixinResetNickEnabled,
    saveWxShareInfo,
    syncWeixinStore,
  };
});
