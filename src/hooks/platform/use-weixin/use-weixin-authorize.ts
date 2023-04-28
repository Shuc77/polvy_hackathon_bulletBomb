/**
 * @file 微信授权 hook
 */
import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
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
  const channelStore = useChannelStore();

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

    // 是否忽略微信授权
    const ignoreWx = ynToBool(channelStore.channelDetail?.channelConfig.ignoreWx, YN.N);
    if (ignoreWx) {
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
  const channelStore = useChannelStore();

  /** 能否进行企业微信授权 */
  const canWorkWeixinAuthorize = computed<boolean>(() => {
    // 非企业微信
    if (!isWorkWeixin) {
      return false;
    }

    // 没有绑定企微
    if (!ynToBool(channelStore.channelDetail?.channelConfig.wxWorkStatusSwitch, YN.N)) {
      return false;
    }

    // 没开启企业微信授权开关
    if (!ynToBool(channelStore.channelDetail?.channelConfig.wxWorkAuthSwitch, YN.N)) {
      return false;
    }

    // 没开启员工邀请
    if (!ynToBool(channelStore.channelDetail?.channelConfig.wxWorkInviteEnabled, YN.N)) {
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
