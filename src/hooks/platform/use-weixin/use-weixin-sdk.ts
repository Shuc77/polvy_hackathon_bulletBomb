/* eslint-disable n/handle-callback-err */
/* eslint-disable promise/prefer-await-to-then */
import { translate } from '@/assets/lang';
import { isWorkWeixin } from '@/assets/utils/browser';
import { messageBox } from '@/components/common-base/message-box';
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

  return new Promise<WechatJsSdk.Wx>((resolve, reject) => {
    const watchCore = getWatchCore();
    Promise.all([
      isWorkWeixin ? loadWorkWxSdk() : loadWxSdk(),
      isWorkWeixin ? watchCore.weixin.getWorkWeixinSign() : watchCore.weixin.getWeixinSign(),
    ])
      .then(([wx, signRes]) => {
        /** 是否已经回调 */
        let hadCalled = false;

        // 保存微信分享信息
        const weixinStore = useWeixinStore();
        if (signRes) {
          weixinStore.saveWxShareInfo({
            isUseWxShareUrl: signRes.isUseWxShareUrl,
            wxShareUrl: signRes.wxShareUrl,
            weixinShareCoverImg: signRes.weixinShareCoverImg,
            shareTitle: signRes.shareTitle,
            shareDesc: signRes.shareDesc,
            weixinShareCustomUrlWithParamEnabled: signRes.weixinShareCustomUrlWithParamEnabled,
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

        setTimeout(() => {
          // 处理 wx-js-sdk 没有触发任何回调的问题
          if (!hadCalled) {
            reject(new Error('wx sdk setTimeout catch error'));
          }
        }, 3000);

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
          hadCalled = true;
          reject(new Error('wx sdk config error'));

          const watchCore = getWatchCore();
          const logMsg = {
            href: location.href,
            error: JSON.stringify(error),
            configData,
          };
          watchCore.logger.error(LoggerName.Weixin, 'config-js-sdk-fail', JSON.stringify(logMsg));
        });

        wx.ready(() => {
          console.info('wx sdk: success');
          hadCalled = true;
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
        reject(new Error('create wx sdk instance catch error'));

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
 * 标志位
 * @desc 只上报一次数据给到 plvLogger
 */
let errorLoggerOnce = false;

/**
 * @hook 使用微信 JS-SDK
 */
export const useWeixinSdk = () => {
  const channelStore = useChannelStore();
  const weixinStore = useWeixinStore();

  const { getWatchCore } = useMultiPolyvWatchApp();

  /** 获取微信 js-sdk */
  const getWeixinSdk = (): Promise<WechatJsSdk.Wx | undefined> => {
    return new Promise(resolve => {
      if (!weixinStore.wxSdkFeatureEnabled) {
        console.warn('weixin-sdk is disabled');
        return resolve(undefined);
      }

      // 不支持企业微信功能
      if (isWorkWeixin && !weixinStore.workWeixinFunctionEnabled) {
        console.warn('work weixin-sdk is disable');
        return resolve(undefined);
      }

      getWeixinSdkByChannelId(channelStore.channelId)
        .then(result => {
          return resolve(result);
        })
        .catch(error => {
          if (!errorLoggerOnce && window.plvLogger) {
            window.plvLogger.error(error);
            errorLoggerOnce = true;
          }

          console.error('getWeixinSdkByChannelId err', error);
          return resolve(undefined);
        });
    });
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
              messageBox({
                title: translate('base.tips'),
                content: translate('withdraw.apply.error.msg'),
                confirmButtonText: translate('base.ok'),
              }).$confirm();

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
