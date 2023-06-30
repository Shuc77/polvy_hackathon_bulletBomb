import { computed, unref } from 'vue';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { PageErrorType, PageErrorData } from '@/app/layout/page-error/page-error-type';

/**
 * @hook 全局错误页-页面错误数据
 */
export const usePageErrorHook = () => {
  /** 页面错误数据，必定存在 */
  const pageError = computed(() => {
    return storeDefinitionToRefs(useWatchAppStore).pageError.value as PageErrorData;
  });

  const isWorkWechatError = computed(() => {
    return unref(pageError).type === PageErrorType.WorkWechatCode;
  });

  const isDisallowMobileWatch = computed(() => {
    return unref(pageError).type === PageErrorType.MobileChannelClosed;
  });

  const isAuthError = computed(() => {
    const authErrorTypes = [
      PageErrorType.ExternalAuthFail,
      PageErrorType.DirectAuthFail,
      PageErrorType.ExternalAuthFail,
    ];
    return authErrorTypes.includes(unref(pageError).type);
  });

  const isNotExistError = computed(() => {
    return (
      unref(pageError).type === PageErrorType.ChannelIdError ||
      unref(pageError).type === PageErrorType.ChannelClosed
    );
  });

  const isNotFoundError = computed(() => {
    return (
      !isAuthError.value &&
      !isNotExistError.value &&
      !isWorkWechatError.value &&
      !isDisallowMobileWatch.value
    );
  });

  function reloadPage() {
    window.location.reload();
  }

  return {
    pageError,

    isWorkWechatError,
    isDisallowMobileWatch,
    isAuthError,
    isNotExistError,
    isNotFoundError,

    reloadPage,
  };
};
