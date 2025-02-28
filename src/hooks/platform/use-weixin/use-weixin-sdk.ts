/* eslint-disable n/handle-callback-err */
/* eslint-disable promise/prefer-await-to-then */
import { isWorkWeixin } from '@/assets/utils/browser';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { loadWorkWxSdk, loadWxSdk } from '@/plugins/external-lib-loaders/load-wx-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { LoggerName } from '@polyv/live-watch-sdk';

/** 创建微信 JS-SDK 实例 */
function createWxInstance() {
  const watchAppStore = useWatchAppStore();
  const { getWatchCore } = useMultiPolyvWatchApp();

  return new Promise<WechatJsSdk.Wx>(resolve => {
    const watchCore = getWatchCore();
    Promise.all([
      isWorkWeixin ? loadWorkWxSdk() : loadWxSdk(),
      isWorkWeixin ? watchCore.weixin.getWorkWeixinSign() : watchCore.weixin.getWeixinSign(),
    ])
      .then(([wx, signRes]) => {
        // 保存微信分享信息
        const weixinStore = useWeixinStore();
        if (signRes) {
          weixinStore.saveWxShareInfo({
            isUseWxShareUrl: signRes.isUseWxShareUrl,
            wxShareUrl: signRes.wxShareUrl,
            weixinShareCoverImg: signRes.weixinShareCoverImg,
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
                watchAppStore.$patch({
                  isWxMiniProgram: true,
                });
              }
            });
          } catch (e) {
            console.error('miniProgram error', e);
          }
        });
      })
      .catch(error => {
        console.error('createWxInstance fail', error);
        const logMsg = {
          href: location.href,
          error: JSON.stringify(error),
        };
        watchCore.logger.error(
          LoggerName.Weixin,
          'create-wx-instance-fail',
          JSON.stringify(logMsg),
        );
      });
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
  const weixinStore = useWeixinStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  /** 获取微信 js-sdk */
  const getWeixinSdk = (): Promise<WechatJsSdk.Wx | undefined> => {
    if (!weixinStore.wxSdkFeatureEnabled) {
      console.warn('weixin-sdk is disabled');
      return new Promise(resolve => resolve(undefined));
    }

    return getWeixinSdkByChannelId(channelStore.channelId);
  };

  /**
   * 检查 api 是否支持
   * @param apiName api 名称
   */
  function checkJsApi(apiName: WechatJsSdk.JsApiNames): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      (async () => {
        const watchCore = getWatchCore();
        const wx = await getWeixinSdk();

        wx?.checkJsApi({
          jsApiList: [apiName],
          success: res => {
            if (res?.checkResult[apiName]) {
              resolve();
            } else {
              const msg = `check js api fail, ${apiName} not support, ${res?.errMsg}`;
              watchCore.logger.error(LoggerName.Weixin, 'check-js-api-fail', msg);
              reject(new Error(msg));
            }
          },
        });
      })();
    });
  }

  return {
    getWeixinSdk,
    checkJsApi,
  };
};
