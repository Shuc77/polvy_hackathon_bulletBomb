/**
 * @file 微信 store
 */
import { WxShareInfo, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { defineStore } from 'pinia';
import { computed, ComputedRef, Ref, ref } from 'vue';
import { useChannelStore } from './use-channel-store';

export interface WeixinStoreState {
  /** 是否已进行微信授权（是否存在 openId） */
  weixinAuthorized: ComputedRef<boolean>;
  /** 是否已进行微信非静默授权（是否存在 wxUser） */
  weixinWatchAuthorized: ComputedRef<boolean>;
  /** 是否已进行企业微信授权（是否存在 wxWorkUserId、cpOpenId 其中一个） */
  workWeixinAuthorized: ComputedRef<boolean>;
  /** 微信分享信息 */
  wxShareInfo: Ref<WxShareInfo>;
  /** 超管后台微信功能开关 */
  weixinAccountFunctionEnabled: ComputedRef<boolean>;
  /** 超管后台中微信支付开关 */
  weixinPayEnabled: ComputedRef<boolean>;
}

export interface WeixinStoreAction {
  /** 保存微信分享信息 */
  saveWxShareInfo: (info: WxShareInfo) => void;
}

export interface WeixinStore extends WeixinStoreState, WeixinStoreAction {}

export const useWeixinStore = defineStore<'weixin', WeixinStore>('weixin', () => {
  const channelStore = useChannelStore();

  /** 是否已进行微信授权（是否存在 openId） */
  const weixinAuthorized = computed<boolean>(() => {
    return !!channelStore.channelDetail?.wxInfo?.openId;
  });

  /** 是否已进行微信非静默授权（是否存在 wxUser） */
  const weixinWatchAuthorized = computed<boolean>(() => {
    return !!channelStore.channelDetail?.wxInfo?.wxUser;
  });

  /** 是否已进行企业微信授权（是否存在 wxWorkUserId、cpOpenId 其中一个） */
  const workWeixinAuthorized = computed<boolean>(() => {
    return !!(
      channelStore.channelDetail?.wxInfo?.wxWorkUserId ||
      channelStore.channelDetail?.wxInfo?.cpOpenId
    );
  });

  /** 微信分享信息 */
  const wxShareInfo = ref<WxShareInfo>({
    isUseWxShareUrl: YN.N,
    wxShareUrl: '',
    shareTitle: '',
    shareDesc: '',
  });

  /** 保存微信分享信息 */
  function saveWxShareInfo(info: WxShareInfo): void {
    wxShareInfo.value = info;
  }

  /** 超管后台微信功能开关 */
  const weixinAccountFunctionEnabled = computed(() =>
    ynToBool(channelStore.channelDetail?.channelConfig.weixinAccountFunctionEnabled ?? YN.N),
  );

  /** 超管后台中微信支付开关 */
  const weixinPayEnabled = computed(() =>
    ynToBool(channelStore.channelDetail?.channelConfig?.weixinPayEnabled ?? YN.N),
  );

  return {
    weixinAuthorized,
    weixinWatchAuthorized,
    workWeixinAuthorized,
    wxShareInfo,
    weixinAccountFunctionEnabled,
    weixinPayEnabled,
    saveWxShareInfo,
  };
});
