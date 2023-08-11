/**
 * @file 微信授权 hook
 */
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { computed } from 'vue';

export interface WxAuthorizeOptions {
  /** 是否使用静默授权，默认：true */
  snsApiBase?: boolean;
}

/** 微信授权跳转参数 */
export interface WxAuthorizeParams {
  /** 频道号 */
  channelId: string;
  /** 授权 token */
  xAuthToken?: string;
  /** 是否非静默授权 */
  watch?: 1;
}

/**
 * @hook 微信授权
 */
export function useWeixinAuthorize() {
  const watchCore = getWatchCore();

  /** 能否进行微信授权 */
  const canWeixinAuthorize = computed<boolean>(() => {
    // 非微信环境
    if (!isWeixin) {
      return false;
    }

    // 当前是企业微信
    if (isWorkWeixin) {
      return false;
    }

    // 是否可以微信授权
    const weixinAuthEnabled = watchCore.weixin.getWeixinAuthEnabled();
    if (!weixinAuthEnabled) {
      return false;
    }

    // 需要强制授权时，页面不进行授权
    const checkForceWxAuth = watchCore.weixin.checkForceWxAuth();
    if (checkForceWxAuth) {
      return false;
    }

    return true;
  });

  /**
   * 跳转微信授权地址
   */
  async function redirectWeixinAuthorize(authorizeOptions: WxAuthorizeOptions = {}) {
    const watchCore = getWatchCore();
    await watchCore.weixin.redirectWeixinAuthorizeUrl({
      snsApiBase: authorizeOptions.snsApiBase,
    });
  }

  return {
    /** 能否进行微信授权 */
    canWeixinAuthorize,
    /** 跳转微信授权地址 */
    redirectWeixinAuthorize,
  };
}

/**
 * 企业微信授权 hook
 */
export function useWorkWeixinAuthorize() {
  const watchCore = getWatchCore();

  /** 能否进行企业微信授权 */
  const canWorkWeixinAuthorize = computed<boolean>(() => {
    // 非企业微信
    if (!isWorkWeixin) {
      return false;
    }

    // 是否可以企微授权
    const workWeixinAuthEnabled = watchCore.weixin.getWorkWeixinAuthEnabled();
    if (!workWeixinAuthEnabled) {
      return false;
    }

    return true;
  });

  /**
   * 跳转企业微信授权地址
   */
  async function redirectWorkWeixinAuthorize(authorizeOptions: WxAuthorizeOptions = {}) {
    const watchCore = getWatchCore();
    await watchCore.weixin.redirectWorkWeixinAuthorizeUrl({
      snsApiBase: authorizeOptions.snsApiBase,
    });
  }

  return {
    /** 能否进行企业微信授权 */
    canWorkWeixinAuthorize,
    /** 跳转企业微信授权地址 */
    redirectWorkWeixinAuthorize,
  };
}
