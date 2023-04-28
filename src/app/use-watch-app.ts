import Vue, { onBeforeMount } from 'vue';

import { getWatchCore, initWatchSdk } from '@/core/watch-sdk';

import { useErrorCatch } from '@/hooks/core/use-error-catch';
import { paramGetter } from '@/hooks/core/use-query-params';
import { usePageSkin } from '@/skins/use-page-skin';
import { useAuthSpecial } from '@/components/page-splash-common/auth/hooks/use-auth-special';
import { useWeixinSetup } from './_hooks/use-weixin-setup';
import { useGlobalEventsEffect } from './_hooks/use-global-events-effect';
import { useBrowserIcon, useBrowserTitle, useGlobalStyle } from './_hooks/use-global-style';
import { loadInteractiveReceiveUI } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { useViewerStore } from '@/store/use-viewer-store';

import { translate } from '@/assets/lang';
import { isMobile, isMockPc } from '@/assets/utils/browser';
import { ynToBool } from '@utils-ts/boolean';

import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { YN } from '@polyv/live-watch-sdk';
import { useLangStore } from '@/store/use-lang-store';
import { LangType } from '@/assets/lang/lang-enum';

/** 错误日志记录 */
const useErrorLogRecord = () => {
  const watchCore = getWatchCore();
  const { windowErrorHandler, promiseErrorHandler, vueErrorHandler } = useErrorCatch(data => {
    watchCore.logger.error('watch-app', 'error-log-record', JSON.stringify(data));
  });

  windowErrorHandler();
  promiseErrorHandler();
  Vue.config.errorHandler = (error, vm, info) => {
    vueErrorHandler(error, vm, info);
  };
};

/**
 * 拦截观看页应用初始化
 * @desc 存在需要拦截的情况下，拦截器内部会自行处理，调用方需要终止初始化函数继续执行
 * @returns 是否需要拦截
 * */
const useInterceptWatchAppInit = (): boolean => {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();

  const channelDetail = watchCore.channel.getChannelDetail();

  // 当前处于分会场，是否需要跳转到主会场进行观看条件授权
  if (ynToBool(channelDetail.action?.mainChannelRedirect, YN.N)) {
    const mainChannelId = channelDetail.multiMeetingSetting?.mainChannelId;
    if (!mainChannelId) {
      console.error('缺少主会场频道号');
      return true;
    }
    const watchUrl = watchCore.channel.generateWatchUrl(mainChannelId.toString());
    location.replace(watchUrl);
    return true;
  }

  // 观看页被关闭
  if (ynToBool(channelDetail.channelInfo.isClosePreview, YN.N)) {
    watchAppStore.setPageError({
      type: PageErrorType.ChannelClosed,
      title: translate('pageError.channelClosed'),
    });
    return true;
  }

  // 移动端观看页被关闭
  if ((isMobile || isMockPc) && !ynToBool(channelDetail.channelInfo.mobileEnabled, YN.Y)) {
    watchAppStore.setPageError({
      type: PageErrorType.MobileChannelClosed,
      title: translate('pageError.mobileChannelClosed'),
    });
    return true;
  }

  return false;
};

/**
 * @hook 观看页应用 hook
 */
export function useWatchApp() {
  useBrowserTitle();
  useBrowserIcon();

  const { setupGlobalStyle, removeSkeleton } = useGlobalStyle();
  const { initPageSkin } = usePageSkin();

  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
  const viewerStore = useViewerStore();
  const liveBookingStore = useLiveBookingStore();
  const langStore = useLangStore();

  function onLayoutMounted() {
    removeSkeleton();
  }

  /** 获取地址上的频道号 */
  function getChannelIdByUrl(): string | undefined {
    let channelId: string | undefined;
    if (/\d+$/.test(window.location.pathname)) {
      channelId = RegExp.lastMatch;
    } else if (paramGetter.channelId()) {
      channelId = paramGetter.channelId();
    }

    if (!channelId) {
      watchAppStore.setPageError({
        type: PageErrorType.ChannelIdError,
        title: translate('pageError.channelClosed'),
      });
      return;
    }

    return channelId;
  }

  /**
   * 设置观看页应用
   */
  async function setupWatchApp(): Promise<void> {
    const channelId = getChannelIdByUrl();
    if (!channelId) {
      return;
    }

    // 初始化观看页 SDK
    initWatchSdk({
      env: WATCH_SDK_ENV,
      channelId,
      vid: paramGetter.vid(),
      testModeToken: paramGetter.testModeToken(),
      promoteId: paramGetter.promoteId(),
      invitePosterId: paramGetter.invitePosterId(),
      wxInviteId: paramGetter.wxInviteId(),
      invitee: paramGetter.invitee(),
      userInfo: {
        userId: paramGetter.viewerid(),
        nick: paramGetter.nickname() || paramGetter.name(),
        pic: paramGetter.avatar(),
      },
      zone: paramGetter.zone(),
      language: langStore.currentLang === LangType.Chinese ? 'zh_CN' : 'en',
    });

    try {
      await Promise.all([
        // 安装观看页核心
        watchAppStore.resetUpWatchCore(),
        // 记载互动功能 UI 组件
        loadInteractiveReceiveUI(),
      ]);
    } catch (error) {
      console.error(error);
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        title: '数据请求异常，页面初始化失败！',
      });
      return;
    }

    // 错误日志记录
    useErrorLogRecord();

    /** 需要拦截观看页应用初始化 */
    const needInterceptWatchAppInit = useInterceptWatchAppInit();
    if (needInterceptWatchAppInit) {
      return;
    }

    // 同步相关 store 的数据
    channelStore.syncChannelStore();
    channelInfoStore.syncChannelInfo();
    viewerStore.syncViewerInfo();
    liveBookingStore.initLiveBookingData();

    // 初始化多皮肤
    initPageSkin();

    // 处理特殊授权
    const { handleSpecialAuth } = useAuthSpecial();
    await handleSpecialAuth();

    // 处理微信流程
    const weixinResult = await useWeixinSetup();
    if (weixinResult) {
      return;
    }

    watchAppStore.$patch({
      watchAppInited: true,
    });
  }

  onBeforeMount(() => {
    setupGlobalStyle();
    setupWatchApp();
  });

  useGlobalEventsEffect();

  return {
    onLayoutMounted,
    getChannelIdByUrl,
  };
}
