/** @file 邀请海报入口 hook 钩子 */

import { translate } from '@/assets/lang';
import { getIosVersion } from '@/assets/utils/browser';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { toast } from '@/hooks/components/use-toast';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useInviteStore } from '@/store/use-invite-store';

export function redirectToPosterPage() {
  const channelMenuStore = useChannelMenuStore();
  const { trackUserClickInvitePoster } = useWatchEventTrack();
  const { generatePosterUrl, generateSeatPosterUrl } = useInviteStore();

  trackUserClickInvitePoster();

  const iosVersion = getIosVersion();
  if (iosVersion && iosVersion <= 9) {
    toast.error(translate('base.system.version.deprecated'));
  } else {
    const url = channelMenuStore.seatTableMenuData ? generateSeatPosterUrl : generatePosterUrl;
    window.location.href = url;
  }
}

export function onClickInvitePosterEntry() {
  redirectToPosterPage();
}
