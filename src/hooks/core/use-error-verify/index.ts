import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { destroyWatchSdk, getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useLangStore } from '@/store/use-lang-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

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
export function redirectToErrorVerify(params: RedirectErrorParams = {}) {
  const channelStore = useChannelStore();
  const langStore = useLangStore();
  const watchCore = getWatchCore();

  /** @PLV-WARN */
  const errorPageUrl = watchCore.utils.generateErrorVerifyPageUrl({
    channelId: channelStore.channelId,
    lang: langStore.currentLang,
    ...params,
  });
  window.location.replace(errorPageUrl);
}

/**
 * 销毁观看页应用
 * @dec 在当前页面直接销毁，不调整外部错误页
 * @warn @PLV-WARN 原则上保利威不推荐在当前页销毁观看页，而是跳转到另外一个单独的错误页由浏览器自行销毁，此处只是提供一个实现钩子，源代码中并没有调用
 */
export function destroyWatchApp() {
  const watchAppStore = useWatchAppStore();

  watchAppStore.setPageError({
    type: PageErrorType.UnknownError,
    desc: '主动销毁观看页',
  });

  // 需要等 vue 组件销毁完，再销毁 watchCore
  setTimeout(() => {
    destroyWatchSdk();
  }, 0);
}

// window.destroyWatchApp = destroyWatchApp;
