/**
 * @file 分享 store
 */
import {
  DEFAULT_SHARE_QQ_ICON,
  DEFAULT_SHARE_QZONE_ICON,
  DEFAULT_SHARE_WEIBO_ICON,
} from '@/assets/constants/defaults';
import { paramGetter } from '@/hooks/core/use-query-params';
import { translate } from '@/assets/lang';
import { copyText, toastCopySuccess } from '@/assets/utils/copy';
import { getWatchCore } from '@/core/watch-sdk';
import { appendToURL } from '@just4/querystring';
import { YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@utils-ts/boolean';
import { changeProtocol } from '@utils-ts/net';
import { defineStore } from 'pinia';
import { computed, ComputedRef, unref } from 'vue';
import { useChannelInfoStore } from './use-channel-info-store';
import { useChannelStore } from './use-channel-store';

/** Web 分享平台枚举 */
enum WebShareType {
  /** QQ 分享 */
  QQ = 'qq',
  /** QQ 空间分享 */
  Qzone = 'qzone',
  /** 微博分享 */
  Weibo = 'weibo',
  /** facebook 分享 */
  Facebook = 'facebook',
  /** 推特分享 */
  Twitter = 'twitter',
}

/** Web 分享数据类型 */
type WebShareData = {
  /** 标题 */
  title: string;
  /** 类型 */
  type: WebShareType;
  /** 分享链接 */
  url: string;
  /** 图标地址 */
  icon: string;
};

/** 各分享平台需要的参数类型 */
type WebShareProvideParams = {
  [WebShareType.QQ]: Record<'url' | 'title' | 'desc' | 'source' | 'pics', string>;
  [WebShareType.Qzone]: Record<'url' | 'title' | 'site', string>;
  [WebShareType.Weibo]: Record<'url' | 'title' | 'pic', string>;
  [WebShareType.Facebook]: Record<'u', string>;
  [WebShareType.Twitter]: Record<'url' | 'text', string>;
};

/** 各分享平台的跳转地址 */
const WebShareRedirectUrl: Record<WebShareType, string> = {
  [WebShareType.QQ]: 'http://connect.qq.com/widget/shareqq/index.html',
  [WebShareType.Qzone]: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey',
  [WebShareType.Weibo]: 'https://service.weibo.com/share/share.php',
  [WebShareType.Facebook]: 'https://www.facebook.com/sharer/sharer.php',
  [WebShareType.Twitter]: 'https://twitter.com/intent/tweet',
};

export interface ShareStoreState {
  /** 分享按钮开关 */
  shareBtnEnabled: ComputedRef<boolean>;
  /** PC web 自定义分享地址 */
  webShareCustomUrl: ComputedRef<string | undefined>;
  /** PC web 分享的观看地址 */
  shareWatchUrl: ComputedRef<string>;
  /** PC web 分享的观看地址二维码地址 */
  shareQrCodeUrl: ComputedRef<string>;
  /** QQ 分享跳转地址 */
  qqShareUrl: ComputedRef<string>;
  /** QQ 空间分享跳转地址 */
  qzoneShareUrl: ComputedRef<string>;
  /** 微博分享跳转地址 */
  weiboShareUrl: ComputedRef<string>;
  /** facebook 分享跳转地址 */
  facebookShareUrl: ComputedRef<string>;
  /** 推特分享跳转地址 */
  twitterShareUrl: ComputedRef<string>;
  /** PC web 分享列表 */
  webShareList: ComputedRef<WebShareData[]>;
}

export interface ShareStoreAction {
  /** 生成 web 分享地址 */
  composeShareUrl: <T extends WebShareType>(
    webShareType: T,
    provideParams: WebShareProvideParams[T],
  ) => string;
  /** 复制分享的观看页地址 */
  copyShareWatchUrl: () => Promise<void>;
}

/** 分享 store */
export interface ShareStore extends ShareStoreState, ShareStoreAction {}

export const useShareStore = defineStore<'share', ShareStore>('share', () => {
  const channelStore = useChannelStore();

  const channelInfoStore = useChannelInfoStore();

  /** 分享按钮开关 */
  const shareBtnEnabled = computed(() =>
    ynToBool(channelStore.channelDetail?.channelConfig?.shareBtnEnabled, YN.N),
  );

  /** PC web 自定义分享地址 */
  const webShareCustomUrl = computed<string | undefined>(
    () => channelStore.channelDetail?.channelInfo.webShareCustomUrl ?? undefined,
  );

  /** PC web 分享的观看地址 */
  const shareWatchUrl = computed<string>(() => {
    // 分享时需带上的参数(如果当前访问url存在这些参数的话)
    const query = {
      promoteId: channelStore.promoteId,
      vid: paramGetter.vid(),
      playbackType: paramGetter.playbackType(),
    };

    // 优先使用 web 自定义分享地址
    const customUrl = unref(webShareCustomUrl);
    if (customUrl) {
      return decodeURIComponent(customUrl);
    }

    return appendToURL(channelStore.watchUrl, query, {
      ignoreEmpty: true,
    });
  });

  /** PC web 分享的观看地址二维码地址 */
  const shareQrCodeUrl = computed<string>(() => {
    const watchCore = getWatchCore();
    return watchCore.utils.generateQrcodeUrl(unref(shareWatchUrl));
  });

  /** QQ 分享跳转地址 */
  const qqShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.QQ, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      source: channelInfoStore.channelTitle,
      desc: '', // qq 分享中描述过长会分享失败
      pics: changeProtocol(channelInfoStore.channelCoverImg, 'http'), // qq 分享的图片需要协议头
    });
  });

  /** QQ 空间分享跳转地址 */
  const qzoneShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Qzone, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      site: channelInfoStore.channelTitle,
    });
  });

  /** 微博分享跳转地址 */
  const weiboShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Weibo, {
      url: unref(shareWatchUrl),
      title: channelInfoStore.channelTitle,
      pic: channelInfoStore.channelCoverImg,
    });
  });

  /** facebook 分享跳转地址 */
  const facebookShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Facebook, {
      u: unref(shareWatchUrl),
    });
  });

  /** 推特分享跳转地址 */
  const twitterShareUrl = computed<string>(() => {
    return composeShareUrl(WebShareType.Twitter, {
      url: unref(shareWatchUrl),
      text: channelInfoStore.channelTitle,
    });
  });

  /** 分享列表 */
  const webShareList = computed<WebShareData[]>(() => {
    return [
      {
        title: translate('share.QQ'),
        type: WebShareType.QQ,
        url: unref(qqShareUrl),
        icon: DEFAULT_SHARE_QQ_ICON,
      },
      {
        title: translate('share.QZone'),
        type: WebShareType.Qzone,
        url: unref(qzoneShareUrl),
        icon: DEFAULT_SHARE_QZONE_ICON,
      },
      {
        title: translate('share.weibo'),
        type: WebShareType.Weibo,
        url: unref(weiboShareUrl),
        icon: DEFAULT_SHARE_WEIBO_ICON,
      },
    ];
  });

  /**
   * 生成分享类型
   * @param webShareType 分享类型
   * @param provideParams 传入参数
   */
  function composeShareUrl<T extends WebShareType>(
    webShareType: T,
    provideParams: WebShareProvideParams[T],
  ): string {
    const baseUrl = WebShareRedirectUrl[webShareType];
    return appendToURL(baseUrl, provideParams);
  }

  /** 复制分享的观看地址 */
  async function copyShareWatchUrl(): Promise<void> {
    await copyText(unref(shareWatchUrl));
    toastCopySuccess();
  }

  return {
    shareBtnEnabled,
    shareWatchUrl,
    webShareCustomUrl,
    shareQrCodeUrl,
    qqShareUrl,
    qzoneShareUrl,
    weiboShareUrl,
    facebookShareUrl,
    twitterShareUrl,
    webShareList,

    composeShareUrl,
    copyShareWatchUrl,
  };
});
