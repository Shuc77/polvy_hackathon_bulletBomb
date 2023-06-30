/**
 * @file 邀请 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

import { getWatchCore } from '@/core/watch-sdk';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

import {
  TAB_NAME_CHAT,
  TAB_NAME_DOC_OR_VIDEO,
  TAB_NAME_MICRO_ACTIVITY,
  TAB_NAME_SEAT,
} from '@/assets/constants/tab-name';
import { paramGetter } from '@/hooks/core/use-query-params';
import { isWeixin } from '@/assets/utils/browser';
import { useLayoutStore } from './use-layout-store';

export interface InviteStoreState {
  /** 企业微信分享海报的企微员工 ID */
  wxInviteId: Ref<string | undefined>;
  /** 邀请海报唯一ID */
  invitePosterId: Ref<string | undefined>;
  /** 当前用户邀请者 openId */
  inviteUserOpenId: Ref<string | undefined>;
  /** 当前用户邀请者 unionId */
  inviteUserUnionId: Ref<string | undefined>;
  /** 邀请海报开关 */
  invitePosterEnabled: Ref<boolean>;
  /** 邀请榜开关 */
  inviteRankEnabled: ComputedRef<boolean>;
  /** 移动端聊天室 Tab 中邀请挂件是否显示 */
  mobileChatInvitePendantVisible: ComputedRef<boolean>;
  /** 移动端页面中常驻的邀请挂件是否显示 */
  mobileWatchInvitePendantVisible: ComputedRef<boolean>;
  /** 邀请海报选择页地址 */
  generatePosterUrl: ComputedRef<string>;
}

export interface InviteStoreAction {
  /** 同步邀请信息 */
  syncInviteInfo: () => void;
}

export interface InviteStore extends InviteStoreState, InviteStoreAction {}

export const useInviteStore = defineStore<'invite', InviteStore>('invite', () => {
  const channelMenuStore = useChannelMenuStore();
  const layoutStore = useLayoutStore();

  /** 企业微信分享海报的企微员工 ID */
  const wxInviteId = ref(paramGetter.wxInviteId());

  /** 邀请海报唯一ID */
  const invitePosterId = ref(paramGetter.invitePosterId());

  /** 邀请者 openId */
  const inviteUserOpenId = ref<string>();

  /** 邀请者 unionId */
  const inviteUserUnionId = ref<string>();

  /** 邀请海报开关 */
  const invitePosterEnabled = ref(false);

  /** 邀请榜开关 */
  const inviteRankEnabled = computed<boolean>(() => {
    return channelMenuStore.inviteRankMenuData.visible;
  });

  /** 移动端聊天室 Tab 中邀请挂件是否显示 */
  const mobileChatInvitePendantVisible = computed<boolean>(() => {
    // 如果存在邀请榜的 tab 则不显示邀请榜挂件
    if (channelMenuStore.inviteRankMenuData.visible) {
      return false;
    }

    return unref(invitePosterEnabled);
  });

  /** 移动端页面中常驻的邀请挂件是否显示 */
  const mobileWatchInvitePendantVisible = computed<boolean>(() => {
    // 如果存在邀请榜的 tab 则不显示邀请榜挂件
    if (channelMenuStore.inviteRankMenuData.visible) {
      return false;
    }

    if (layoutStore.isPageFullscreenOrHorizontalScreen) {
      return false;
    }

    // 当前在以下的 tabName 不显示
    const excludeTabName: string[] = [
      TAB_NAME_CHAT,
      TAB_NAME_SEAT,
      TAB_NAME_MICRO_ACTIVITY,
      TAB_NAME_DOC_OR_VIDEO,
    ];
    if (excludeTabName.includes(layoutStore.mobileMenuCurrentName)) {
      return false;
    }

    return unref(invitePosterEnabled);
  });

  /** 邀请海报选择页地址 */
  const generatePosterUrl = computed<string>(() => {
    const watchCore = getWatchCore();
    return watchCore.invite.getInviteGeneratePosterUrl();
  });

  /** 同步邀请信息 */
  function syncInviteInfo() {
    const watchCore = getWatchCore();

    invitePosterEnabled.value = isWeixin && watchCore.invite.getInvitePosterEnabled();

    const inviteUserInfo = watchCore.invite.getInviteUserInfo(false);
    inviteUserOpenId.value = inviteUserInfo?.inviteOpenId;
    inviteUserUnionId.value = inviteUserInfo?.inviteUnionId;

    invitePosterId.value = watchCore.invite.getInvitePosterId();
    wxInviteId.value = watchCore.invite.getWorkWxInviteId();
  }

  return {
    wxInviteId,
    invitePosterId,
    inviteUserOpenId,
    inviteUserUnionId,
    invitePosterEnabled,
    inviteRankEnabled,
    mobileChatInvitePendantVisible,
    mobileWatchInvitePendantVisible,
    generatePosterUrl,
    syncInviteInfo,
  };
});
