import { onBeforeMount } from 'vue';

import { getWatchCore, initWatchSdk } from '@/core/watch-sdk';

import { useAuthSpecial } from '@/components/page-splash-common/auth/hooks/use-auth-special';
import { paramGetter } from '@/hooks/core/use-query-params';
import { usePageSkin } from '@/skins/use-page-skin';
import { useGlobalEventsEffect } from './_hooks/use-global-events-effect';
import { useBrowserIcon, useBrowserTitle, useGlobalStyle } from './_hooks/use-global-style';
import { useWeixinSetup } from './_hooks/use-weixin-setup';

import { useSyncStoreForWatchApp } from '@/hooks/core/use-sync-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

import { translate } from '@/assets/lang';
import { isMobile, isMockPc } from '@/assets/utils/browser';
import { loadForceAutoplay } from '@/assets/utils/video/force-autoplay';

import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { useMultiMeetingRedirect } from '@/components/page-watch-common/multi-meeting/hooks/use-multi-meeting-redirect';
import { getDefaultLang, convert2WatchSdkLang } from '@/store/use-lang-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useWeixinConfig } from '@/hooks/platform/use-weixin/use-weixin-config';
import { useSaleInviteIntercept } from './_hooks/use-sale-invite-intercept';
import { useUserIdentityIntercept } from './_hooks/use-user-identity-intercept';

/**
 * 拦截观看页应用初始化
 * @desc 存在需要拦截的情况下，拦截器内部会自行处理，调用方需要终止初始化函数继续执行
 * @returns 是否需要拦截
 * */
const useInterceptWatchAppInit = async (): Promise<boolean> => {
  const watchCore = getWatchCore();
  const watchAppStore = useWatchAppStore();

  // 一客一码验证拦截
  const { checkSaleInvite } = useSaleInviteIntercept();
  const checkSaleInviteResult = await checkSaleInvite();
  if (checkSaleInviteResult) {
    return true;
  }

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

export function createWatchApp() {
  const { initPageSkin } = usePageSkin();

  const { syncStoreBeforeWatchAppInited } = useSyncStoreForWatchApp();

  const channelStore = useChannelStore();
  const watchAppStore = useWatchAppStore();

  const { toConfigWeixinFeature } = useWeixinConfig();

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
    const watchCore = initWatchSdk({
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
        actor: paramGetter.actor(),
      },
      inviteInfo: {
        invitePosterId: paramGetter.invitePosterId(),
        wxInviteId: paramGetter.wxInviteId(),
        invitee: paramGetter.invitee(),
      },
      domainInfo: {
        // @PLV-WARN
        // 此处可以传入相关的域名配置，非必要无需修改，使用 SDK 内部默认值即可，需要注意保利威的业务页面会依赖 watchPageDomain 参数去拼接域名跳转，具体业务可以咨询保利威团队
      },
      autoAuthParams: {
        code: paramGetter.password(),
        ignoreWxAuth: paramGetter.ignoreWxAuth(),
        wxSnapshotPageMode: paramGetter.snapshotPage(),
      },
      saleInviteParams: {
        saleCode: paramGetter.saleCode(),
        inviteCustomerId: paramGetter.inviteCustomerId(),
      },
      statisticsParams: {
        param4: paramGetter.param4(),
        param5: paramGetter.param5(),
      },
      sdkIntegration: {
        interactionSdkScriptUrl: paramGetter.interactionSdkScriptUrl(),
        livePlayerScriptUrl: paramGetter.livePlayerScriptUrl(),
        liveLowLatencyPlayerScriptUrl: paramGetter.liveLowLatencyPlayerScriptUrl(),
        vodPlayerScriptUrl: paramGetter.vodPlayerScriptUrl(),
        rtcWebScriptUrl: paramGetter.rtcWebScriptUrl(),
        chatSdkScriptUrl: paramGetter.chatSdkScriptUrl(),
      },
    });

    // 安装观看页 SDK 核心
    await watchAppStore.resetUpWatchCore();

    // 配置微信 SDK
    toConfigWeixinFeature(watchCore);

    // 同步相关 store 数据
    syncStoreBeforeWatchAppInited();

    /** 需要拦截观看页应用初始化 */
    const needInterceptWatchAppInit = await useInterceptWatchAppInit();
    if (needInterceptWatchAppInit) {
      return;
    }

    // 处理特殊授权，授权出现异常只会弹 toast，不中断页面渲染
    const { handleSpecialAuth } = useAuthSpecial();
    const isSpecialAuthError = await handleSpecialAuth();
    if (isSpecialAuthError) {
      return;
    }

    // 处理微信流程
    const weixinResult = await useWeixinSetup();
    if (weixinResult) {
      return;
    }

    // 用户系统手机号拦截
    const { checkIdentityInfoLogin } = useUserIdentityIntercept();
    const checkIdentityInfoLoginResult = checkIdentityInfoLogin();
    if (checkIdentityInfoLoginResult) {
      return;
    }

    // 初始化完毕，设置渲染标识位
    watchAppStore.$patch({
      watchAppInited: true,
    });

    // 初始化多皮肤
    initPageSkin();

    // 处理强制自动播放，pc不支持该逻辑
    if (paramGetter.watchPageInitStatus() === 'active' && isMobile) {
      loadForceAutoplay();
    }
  }

  return {
    setupWatchApp,
  };
}

/**
 * @hook 观看页应用 hook
 */
export function useWatchApp() {
  // 设置浏览器标题和logo
  useBrowserTitle();
  useBrowserIcon();

  const { setupWatchApp } = createWatchApp();

  const { setupGlobalStyle, removeSkeleton } = useGlobalStyle();

  function onLayoutMounted() {
    removeSkeleton();
  }

  onBeforeMount(() => {
    setupGlobalStyle();
    setupWatchApp();
  });

  useGlobalEventsEffect();

  return {
    onLayoutMounted,
  };
}
