import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { createWatchApp } from '@/app/use-watch-app';
import { destroyWatchSdk, getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useLangStore } from '@/store/use-lang-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { translate } from '@/assets/lang';

/** 错误页类型 */
export enum ErrorVerifyType {
  /** 超过观看并发人数限制 */
  Restrict = 'restrict',
  /** 被踢出直播间 */
  isKicked = 'isKicked',
}

export interface RedirectErrorParams {
  /** 异常类型 */
  errorType?: ErrorVerifyType;
  /** 错误来源 */
  causeBy?: string;
}

/**
 * 跳转到错误页
 */
export async function redirectToErrorVerify(params: RedirectErrorParams = {}) {
  const channelStore = useChannelStore();
  const langStore = useLangStore();
  const watchCore = getWatchCore();

  /** @PLV-WARN */
  const errorPageUrl = watchCore.utils.generateErrorVerifyPageUrl({
    channelId: channelStore.channelId,
    lang: langStore.currentLang,
    ...params,
  });

  // 此处销毁当前应用是为了兼容部分浏览器调用 replace 方法时会询问用户是否离开当前页面做的兼容处理
  await destroyWatchApp(translate('pageError.kicked'));

  window.location.replace(errorPageUrl);
}

/**
 * 销毁观看页应用
 * @dec 在当前页面直接销毁，不跳转到外部错误页
 * @warn @PLV-WARN 原则上保利威不推荐在当前页销毁观看页，而是跳转到另外一个单独的错误页由浏览器自行销毁
 */
export function destroyWatchApp(desc?: string) {
  return new Promise<void>(resolve => {
    const watchAppStore = useWatchAppStore();

    watchAppStore.setPageError({
      type: PageErrorType.UnknownError,
      desc: desc || '主动销毁观看页',
    });

    // 需要等 vue 组件销毁完，再销毁 watchCore
    setTimeout(() => {
      // @PLV-WARN 如果需要在销毁的同时清除授权信息，可以调用该方法主动清除，默认销毁不会清除授权信息
      // getWatchCore().setXAuthToken('');

      destroyWatchSdk();
      resolve();
    }, 0);
  });
}

/**
 * 销毁观看页应用
 * @dec 在当前页面重新创建观看页应用，配合 {@link destroyWatchApp} 使用
 * @warn @PLV-WARN 原则上保利威不推荐在当前页重新创建，此处只是提供一个实现钩子，源代码中并没有调用，仅适用于同个频道的场景下
 */
export function reCreateWatchApp() {
  const watchAppStore = useWatchAppStore();
  const interactReceiveStore = useInteractReceiveStore();
  const playbackStore = usePlaybackStore();

  const { setupWatchApp } = createWatchApp();

  watchAppStore.$patch({
    pageError: undefined,
    watchPageInited: false,
    watchAppInited: false,
    isLiveWatchConnected: false,
    watchPageChatConnected: false,
  });

  interactReceiveStore.$patch({
    iarSdkLoaded: false,
  });

  playbackStore.resetPlaybackStoreData();

  setupWatchApp();
}

// window.destroyWatchApp = destroyWatchApp;
// window.reCreateWatchApp = reCreateWatchApp;
