import { useChannelStore } from '@/store/use-channel-store';
import { useLangStore } from '@/store/use-lang-store';
import { appendToURL } from '@just4/querystring';

/** 错误页类型 */
export enum ErrorVerifyType {
  /** 超出最大并发数 */
  Restrict = 'restrict',
}

export interface RedirectErrorParams {
  /** 异常类型 */
  errorType?: ErrorVerifyType;
}

/**
 * 跳转到错误页
 */
export function redirectToErrorVerify(params: RedirectErrorParams = {}) {
  const channelStore = useChannelStore();
  const langStore = useLangStore();

  const errorPageUrl = appendToURL('/error-verify', {
    channelId: channelStore.channelId,
    lang: langStore.currentLang,
    ...params,
  });
  window.location.replace(errorPageUrl);
}
