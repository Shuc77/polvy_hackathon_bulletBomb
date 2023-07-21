import Vue, { onBeforeMount } from 'vue';

import { getWatchCore, initWatchSdk } from '@/core/watch-sdk';

import { useAuthSpecial } from '@/components/page-splash-common/auth/hooks/use-auth-special';
import { useErrorCatch } from '@/hooks/core/use-error-catch';
import { paramGetter, removeQueryParam } from '@/hooks/core/use-query-params';
import { usePageSkin } from '@/skins/use-page-skin';
import { useGlobalEventsEffect } from './_hooks/use-global-events-effect';
import { useBrowserIcon, useBrowserTitle, useGlobalStyle } from './_hooks/use-global-style';
import { useIarSetup } from './_hooks/use-iar-setup';
import { useWeixinSetup } from './_hooks/use-weixin-setup';

import { useSyncStoreForWatchApp } from '@/hooks/core/use-sync-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

import { translate } from '@/assets/lang';
import { isMobile, isMockPc } from '@/assets/utils/browser';

import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { useMultiMeetingRedirect } from '@/components/page-watch-common/multi-meeting/hooks/use-multi-meeting-redirect';
import { getDefaultLang, convert2WatchSdkLang } from '@/store/use-lang-store';
import { useChannelStore } from '@/store/use-channel-store';

/** 错误日志记录 */
const useErrorLogRecord = () => {
  // const watchCore = getWatchCore();
  const { windowErrorHandler, promiseErrorHandler, vueErrorHandler } = useErrorCatch(data => {
    // watchCore.logger.error('watch-app', 'error-log-record', JSON.stringify(data));
    console.log(data);
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
  const { checkRedirectMainChannelAuth, checkRedirectSubChannel } = useMultiMeetingRedirect();

  // 当前处于分会场，是否需要跳转到主会场进行观看条件授权
  const checkMainChannelResult = checkRedirectMainChannelAuth();
  if (checkMainChannelResult) {
    return true;
  }

  // 当前处于主会场，是否需要跳回分会场
  const checkSubChannelResult = checkRedirectSubChannel();
  if (checkSubChannelResult) {
    return true;
  }

  const watchSetting = watchCore.channel.getWatchSetting();
  // 观看页被关闭
  if (!watchSetting.watchEnabled) {
    watchAppStore.setPageError({
      type: PageErrorType.ChannelClosed,
      title: translate('pageError.channel.closed'),
      desc: translate('pageError.channel.feedBack'),
    });
    return true;
  }

  // 移动端观看页被关闭
  if ((isMobile || isMockPc) && !watchSetting.mobileWatchEnabled) {
    watchAppStore.setPageError({
      type: PageErrorType.MobileChannelClosed,
      title: translate('pageError.platform.onlyPc'),
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

  const { syncStoreBeforeWatchAppInited } = useSyncStoreForWatchApp();
  const { loadIarSDK } = useIarSetup();

  const channelStore = useChannelStore();
  const watchAppStore = useWatchAppStore();

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
    return channelId;
  }

  /**
   * 设置观看页应用
   */
  async function setupWatchApp(): Promise<void> {
    const channelId = getChannelIdByUrl();
    if (!channelId) {
      watchAppStore.setPageError({
        type: PageErrorType.ChannelIdError,
        title: translate('pageError.channel.notExist'),
        desc: translate('pageError.channel.feedBack'),
      });
      return;
    }

    // 保存频道号到 store
    channelStore.$patch({ channelId });

    // 初始化观看页 SDK
    initWatchSdk({
      channelId,
      env: WATCH_SDK_ENV,
      language: convert2WatchSdkLang(getDefaultLang()),
      promoteId: paramGetter.promoteId(),
      testModeToken: paramGetter.testModeToken(),
      zone: paramGetter.zone(),
      vid: paramGetter.vid(),
      playbackOrigin: paramGetter.playbackType(),
      ipPlay: paramGetter.ipPlay() === '1',
      userInfo: {
        userId: paramGetter.viewerid(),
        nick: paramGetter.nickname() || paramGetter.name(),
        pic: paramGetter.avatar(),
      },
      inviteInfo: {
        invitePosterId: paramGetter.invitePosterId(),
        wxInviteId: paramGetter.wxInviteId(),
        invitee: paramGetter.invitee(),
      },
      autoAuthParams: {
        code: paramGetter.password(),
      },
      statisticsParams: {
        param4: paramGetter.param4(),
        param5: paramGetter.param5(),
      },
    });

    // 安装观看页 SDK 核心
    await watchAppStore.resetUpWatchCore();

    // 加载互动功能 SDK
    await loadIarSDK();

    // 同步相关 store 数据
    syncStoreBeforeWatchAppInited();

    /** 需要拦截观看页应用初始化 */
    const needInterceptWatchAppInit = useInterceptWatchAppInit();
    if (needInterceptWatchAppInit) {
      return;
    }

    // 处理特殊授权，授权出现异常只会弹 toast，不中断页面渲染
    const { handleSpecialAuth } = useAuthSpecial();
    await handleSpecialAuth();

    // 处理微信流程
    const weixinResult = await useWeixinSetup();
    if (weixinResult) {
      return;
    }

    // 移除地址上不需要用的参数
    removeQueryParam(['name', 'password']);

    // 初始化多皮肤
    initPageSkin();

    // 错误日志记录
    useErrorLogRecord();

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
