import { isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { appendUrl, fitProtocol } from '@/assets/utils/url';
import { getWatchCore } from '@/core/watch-sdk';
import { useInviteStore } from '@/store/use-invite-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useShareStore } from '@/store/use-share-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { LoggerName, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { computed, unref } from 'vue';
import { useWeixinSdk } from './use-weixin-sdk';

/** 微信分享地址中附带的参数 */
interface WxShareUrlParams {
  /** 企微邀请的员工 id */
  wxInviteId?: string;
  /** 邀请人 id */
  invitePosterId?: string;
  /** 回放分享-回放 Id */
  playBackVid?: string;
}

/**
 * @hook 微信分享
 * */
export const useWeixinShare = () => {
  const { getWeixinSdk } = useWeixinSdk();

  const themeStore = useThemeStore();
  const shareStore = useShareStore();
  const weixinStore = useWeixinStore();
  const inviteStore = useInviteStore();
  const playbackStore = usePlaybackStore();
  const watchAppStore = useWatchAppStore();

  /** 微信分享地址上需要携带的参数 */
  const wxShareUrlParams = computed(() => {
    const params: WxShareUrlParams = {};

    // 企微邀请的员工 id
    if (inviteStore.wxInviteId) {
      params.wxInviteId = inviteStore.wxInviteId;
    }

    // 针对开启邀请的频道添加邀请参数到微信分享 url
    if (inviteStore.invitePosterEnabled && inviteStore.invitePosterId) {
      params.invitePosterId = inviteStore.invitePosterId;
    }

    return params;
  });

  /** 微信分享中的分享标题 */
  const wxShareTitle = computed(() => {
    const shareInfo = weixinStore.wxShareInfo;
    const defaultShareTitle = shareInfo.shareTitle;

    if (watchAppStore.isPlaybackWatchUrl) {
      return watchAppStore.playbackWatchBasicInfo.videoName || defaultShareTitle;
    }

    if (ynToBool(shareInfo.isUseWxShareUrl, YN.N)) {
      return defaultShareTitle;
    }

    if (shareStore.playbackShareTitleEnabled && playbackStore.currentPlaybackTarget) {
      return playbackStore.currentPlaybackTarget.title;
    }

    return defaultShareTitle;
  });

  /** 微信分享中的分享地址 */
  const wxShareUrl = computed(() => {
    const shareInfo = weixinStore.wxShareInfo;

    if (watchAppStore.isPlaybackWatchUrl) {
      return window.location.href;
    }

    // 使用后台设置的自定义微信分享地址
    if (ynToBool(shareInfo.isUseWxShareUrl, YN.N)) {
      return shareInfo.wxShareUrl;
    }

    return appendUrl<WxShareUrlParams>(window.location.href, unref(wxShareUrlParams));
  });

  /** 隐藏微信分享 */
  async function hideWeixinShare() {
    const wx = await getWeixinSdk();
    wx && wx.hideAllNonBaseMenuItem();
  }

  /**
   * 更新微信分享配置
   */
  async function updateWxShareConfig(shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption) {
    const watchCore = getWatchCore();
    const wx = await getWeixinSdk();

    // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
    wx &&
      wx.updateAppMessageShareData({
        ...shareOptions,
        success() {
          console.info('Wx sdk: updateAppMessageShareData success');
        },
        fail(e) {
          watchCore.logger.error(
            LoggerName.Weixin,
            'update-app-message-share-fail',
            JSON.stringify(e),
          );
        },
      });

    // 自定义“分享到朋友圈”及“分享到 QQ 空间”按钮的分享内容
    wx &&
      wx.updateTimelineShareData({
        ...shareOptions,
        success() {
          console.info('Wx sdk: updateTimelineShareData success');
        },
        fail(e) {
          watchCore.logger.error(
            LoggerName.Weixin,
            'update-timeline-share-fail',
            JSON.stringify(e),
          );
        },
      });
  }

  /**
   * 更新企业微信分享配置
   */
  async function updateWorkWxShareConfig(
    shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption,
  ) {
    const watchCore = getWatchCore();
    const wx = await getWeixinSdk();

    // 自定义转发
    wx.onMenuShareAppMessage &&
      wx.onMenuShareAppMessage({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareAppMessage success');
        },
        fail(e) {
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-app-message-fail',
            JSON.stringify(e),
          );
        },
      });

    wx.onMenuShareWechat &&
      wx.onMenuShareWechat({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareWechat success');
        },
        fail(e) {
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-share-wechat-fail',
            JSON.stringify(e),
          );
        },
      });

    // 自定义分享到微信朋友圈
    wx.onMenuShareTimeline &&
      wx.onMenuShareTimeline({
        ...shareOptions,
        success() {
          console.info('Wx sdk: onMenuShareTimeline success');
        },
        fail(e) {
          watchCore.logger.error(
            LoggerName.Weixin,
            'on-menu-share-timeline-fail',
            JSON.stringify(e),
          );
        },
      });
  }

  /** 设置微信分享 */
  async function configureWeixinShare() {
    // 后台没开启分享开关，隐藏微信分享
    if (!shareStore.shareBtnEnabled) {
      return hideWeixinShare();
    }

    const shareInfo = weixinStore.wxShareInfo;

    const shareOptions: WechatJsSdk.UpdateAppMessageShareDataOption = {
      title: unref(wxShareTitle),
      desc: shareInfo.shareDesc || '',
      link: unref(wxShareUrl),
      imgUrl: fitProtocol(themeStore.channelCoverImg),
    };

    console.info('weixin shareOptions', shareOptions);

    if (isWeixin && !isWorkWeixin) {
      await updateWxShareConfig(shareOptions);
    }

    if (isWorkWeixin) {
      await updateWorkWxShareConfig(shareOptions);
    }
  }

  return {
    wxShareUrlParams,
    wxShareUrl,
    hideWeixinShare,
    configureWeixinShare,
  };
};
