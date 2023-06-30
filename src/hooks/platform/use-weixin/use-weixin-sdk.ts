import { isWorkWeixin } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { loadWorkWxSdk, loadWxSdk } from '@/plugins/external-lib-loaders/load-wx-sdk';
import { LoggerName } from '@polyv/live-watch-sdk';

/** 创建微信 JS-SDK 实例 */
function createWxInstance() {
  return new Promise<WechatJsSdk.Wx>(resolve => {
    (async () => {
      const watchCore = getWatchCore();
      const [wx, signRes] = await Promise.all([
        isWorkWeixin ? loadWorkWxSdk() : loadWxSdk(),
        isWorkWeixin ? watchCore.weixin.getWorkWeixinSign() : watchCore.weixin.getWeixinSign(),
      ]);

      // 保存微信分享信息
      const weixinStore = useWeixinStore();
      if (signRes) {
        weixinStore.saveWxShareInfo({
          isUseWxShareUrl: signRes.isUseWxShareUrl,
          wxShareUrl: signRes.wxShareUrl,
          shareTitle: signRes.shareTitle,
          shareDesc: signRes.shareDesc,
        });
      }

      // 配置微信分享
      const { appId, timestamp, nonceStr, signature } = signRes?.wxSign || {};

      const configData = {
        appId,
        timestamp,
        nonceStr,
        signature,
      };

      console.info('wx.config', configData);

      wx.config({
        appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'hideAllNonBaseMenuItem',
          'chooseWXPay',
          'previewImage',
          'onMenuShareAppMessage',
          'onMenuShareWechat',
          'shareAppMessage',
          'shareWechatMessage',
          'onMenuShareTimeline',
        ],
        openTagList: ['wx-open-launch-weapp'],
      });

      wx.error(error => {
        console.error('Wx sdk: error', error);

        const watchCore = getWatchCore();
        const logMsg = {
          href: location.href,
          error: JSON.stringify(error),
          configData,
        };
        watchCore.logger.error(LoggerName.Weixin, 'config-js-sdk-fail', JSON.stringify(logMsg));
      });

      wx.ready(() => {
        console.info('Wx sdk: success');
        resolve(wx);

        // 获取是否微信小程序环境
        try {
          wx.miniProgram?.getEnv(res => {
            if (res?.miniprogram === true) {
              const watchAppStore = useWatchAppStore();
              watchAppStore.isWxMiniProgram = true;
            }
          });
        } catch (e) {
          console.error('miniProgram error', e);
        }
      });
    })();
  });
}

const wxLoaders: Record<string, Promise<WechatJsSdk.Wx> | undefined> = {};

/**
 * 通过 channelId 来获取微信实例
 */
function getWeixinSdkByChannelId(channelId: string): Promise<WechatJsSdk.Wx> {
  let promiseTarget = wxLoaders[channelId];
  if (promiseTarget) {
    return promiseTarget;
  }

  promiseTarget = createWxInstance();

  wxLoaders[channelId] = promiseTarget;

  return promiseTarget;
}

/**
 * @hook 使用微信 JS-SDK
 */
export const useWeixinSdk = () => {
  const channelStore = useChannelStore();

  /** 获取微信 js-sdk */
  const getWeixinSdk = () => {
    return getWeixinSdkByChannelId(channelStore.channelId);
  };

  return {
    getWeixinSdk,
  };
};
