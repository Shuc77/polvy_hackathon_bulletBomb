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
    return (
      unref(pageError).type === PageErrorType.WorkWechatBusinessError ||
      unref(pageError).type === PageErrorType.WorkWechatFriend
    );
  });

  /** 添加企微好友页面 */
  const isWorkWechatFriendPage = computed(() => {
    return unref(pageError).type === PageErrorType.WorkWechatFriend;
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

  /** 一客一码验证页 */
  const isVerifySaleInvitePage = computed(() => {
    return unref(pageError).type === PageErrorType.VerifySaleInvite;
  });

  const isNotFoundError = computed(() => {
    return (
      !isAuthError.value &&
      !isNotExistError.value &&
      !isWorkWechatError.value &&
      !isDisallowMobileWatch.value &&
      !isVerifySaleInvitePage.value
    );
  });

  function reloadPage() {
    window.location.reload();
  }

  return {
    pageError,

    isWorkWechatError,
    isWorkWechatFriendPage,

    isDisallowMobileWatch,
    isAuthError,
    isNotExistError,
    isNotFoundError,

    isVerifySaleInvitePage,

    reloadPage,
  };
};
