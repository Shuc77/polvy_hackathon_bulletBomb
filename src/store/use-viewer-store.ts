/**
 * @file 观众信息 store
 */
import { AuthType, DEFAULT_VIEWER_AVATAR } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useEnrollStore } from './use-enroll-store';
import { isWeixin } from '@/assets/utils/browser';
import { useWeixinStore } from './use-weixin-store';
import { appEvents, eventBus } from '@/app/app-events';

/**
 * 检测是否为默认用户名 [内网、外网、xx]观众/[数字]
 */
function __checkDefaultUserNick(nickname: string): boolean {
  const nicknamePrefix = '观众';
  const nickNamePattern = new RegExp(nicknamePrefix + '/[0-9]+$');
  return nickNamePattern.test(nickname);
}

export interface ViewerStoreState {
  /** 用户唯一标识 */
  viewerId: Ref<string | undefined>;
  /** 用户昵称 */
  nickname: Ref<string>;
  /** 用户头像 */
  avatar: Ref<string>;
  /** 当前用户的微信 openid */
  openId: Ref<string | undefined>;
  /** 当前用户的微信 unionId */
  unionId: Ref<string | undefined>;
  /** 当前用户的授权方式 */
  authType: Ref<AuthType>;
  /** 当前能否设置昵称 */
  canSetNick: ComputedRef<boolean>;
  /** 当前是否已设置昵称 */
  hasNickname: ComputedRef<boolean>;
  /** 当前是否需要实名认证 */
  needRealNameAuth: Ref<boolean>;
}

export interface ViewerStoreAction {
  /** 同步观众信息 */
  syncViewerInfo: () => void;
  /** 检查是否需要实名认证 */
  syncNeedRealNameAuth: () => Promise<void>;
  /** 检查实名认证，返回 true 表示终止程序执行 */
  checkNeedRealNameAuth: () => boolean;
}

export interface ViewerStore extends ViewerStoreState, ViewerStoreAction {}

export const useViewerStore = defineStore<'viewer', ViewerStore>('viewer', () => {
  const enrollStore = useEnrollStore();
  const weixinStore = useWeixinStore();

  /** 用户唯一标识 */
  const viewerId = ref<string>();
  /** 用户昵称 */
  const nickname = ref<string>('');
  /** 用户头像 */
  const avatar = ref<string>(DEFAULT_VIEWER_AVATAR);
  /** openId */
  const openId = ref<string>();
  /** unionId */
  const unionId = ref<string>();
  /** 授权方式 */
  const authType = ref<AuthType>(AuthType.None);

  /** 当前能否设置昵称 */
  const canSetNick = computed<boolean>(() => {
    // 报名观看使用姓名作为昵称
    if (enrollStore.enrollNickEnabled) {
      return false;
    }

    // 允许的观看条件
    const allowAuthTypes = [AuthType.None, AuthType.Code, AuthType.Info];
    if (!allowAuthTypes.includes(unref(authType))) {
      return false;
    }

    // 支持在微信中重新设置昵称
    if (isWeixin && weixinStore.weixinResetNickEnabled) {
      return true;
    }

    // 微信中、微信非静默授权已经有昵称的情况
    if (isWeixin && weixinStore.weixinWatchAuthorized && nickname.value) {
      // 如果还是默认名称，则支持设置昵称
      return __checkDefaultUserNick(nickname.value);
    }

    return true;
  });

  /** 当前是否已设置昵称 */
  const hasNickname = computed(() => {
    // 如果当前不允许设置昵称，则默认已经设置过昵称了
    if (!unref(canSetNick)) {
      return true;
    }

    // 没有昵称
    if (!nickname.value) {
      return false;
    }

    return !__checkDefaultUserNick(nickname.value);
  });

  /** 同步观众信息 */
  function syncViewerInfo(): void {
    const watchCore = getWatchCore();

    viewerId.value = watchCore.user.getUserId();
    nickname.value = watchCore.user.getUserNick() || '';
    avatar.value = watchCore.user.getUserAvatar() || DEFAULT_VIEWER_AVATAR;
    openId.value = watchCore.user.getUserOpenId();
    unionId.value = watchCore.user.getUserUnionId();
    authType.value = watchCore.user.getUserAuthType();
  }

  /** 当前是否需要实名认证 */
  const needRealNameAuth = ref(false);

  /**
   * 检查是否需要实名认证
   */
  async function syncNeedRealNameAuth() {
    const watchCore = getWatchCore();
    needRealNameAuth.value = await watchCore.user.needRealNameAuth();
  }

  /**
   * 检查实名认证，返回 true 表示终止程序执行
   */
  function checkNeedRealNameAuth(): boolean {
    if (unref(needRealNameAuth)) {
      eventBus.$emit(appEvents.global.OpenRealNameDialog, true);
    }

    return unref(needRealNameAuth);
  }

  return {
    viewerId,
    nickname,
    avatar,
    openId,
    unionId,
    authType,
    canSetNick,
    hasNickname,
    syncViewerInfo,

    needRealNameAuth,
    syncNeedRealNameAuth,
    checkNeedRealNameAuth,
  };
});
