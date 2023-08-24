import { getWatchCore } from '@/core/watch-sdk';
import { queryParams } from '@/hooks/core/use-query-params';
import { appendToURL } from '@just4/querystring';

/**
 * 分会场跳转相关 hook
 */
export const useMultiMeetingRedirect = () => {
  /**
   * 跳转到会场的频道号
   * @param channelId 频道号
   */
  function redirectToMultiMeetingChannel(channelId: string): void {
    const watchCore = getWatchCore();
    const watchUrl = watchCore.channel.generateWatchUrl(channelId);

    location.replace(appendToURL(watchUrl, queryParams));
  }

  /**
   * 检查当前是否需要跳转到主会场进行授权，并执行跳转到主会场
   * @returns 返回当前是否被跳转
   */
  function checkRedirectMainChannelAuth(): boolean {
    const watchCore = getWatchCore();
    const multiMeetingSetting = watchCore.multiMeeting.getMultiMeetingSetting();

    // 当前处于分会场，是否需要跳转到主会场进行观看条件授权
    if (multiMeetingSetting.needRedirectChannelAuth) {
      const channelId = multiMeetingSetting.redirectAuthChannelId;
      if (!channelId) {
        console.error('缺少授权会场频道号');
        return true;
      }

      redirectToMultiMeetingChannel(channelId);
      return true;
    }

    return false;
  }

  /**
   * 检查当前是否从分会场跳转到主会场并授权成功，并执行跳转到分会场
   * @returns 返回当前是否被跳转
   */
  function checkRedirectSubChannel(): boolean {
    const watchCore = getWatchCore();

    // 如果未观看条件授权则不跳转
    if (!watchCore.auth.isAuthorized()) {
      return false;
    }

    const redirectSubChannelData = watchCore.multiMeeting.getRedirectSubChannelData();
    if (redirectSubChannelData.needRedirectSubChannel) {
      const redirectSubChannelId = redirectSubChannelData.redirectSubChannelId;
      if (!redirectSubChannelId) {
        console.error('缺少分会场频道号');
        return true;
      }

      redirectToMultiMeetingChannel(redirectSubChannelId);
      return true;
    }

    return false;
  }

  return {
    checkRedirectMainChannelAuth,
    checkRedirectSubChannel,
  };
};
