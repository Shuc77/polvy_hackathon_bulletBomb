/** @file 邀请海报入口 hook 钩子 */

import { translate } from '@/assets/lang';
import { getIosVersion } from '@/assets/utils/browser';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { toast } from '@/hooks/components/use-toast';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useInviteStore } from '@/store/use-invite-store';

export function redirectToPosterPage() {
  const channelMenuStore = useChannelMenuStore();
  const { generatePosterUrl, getGenerateSeatPosterUrl } = useInviteStore();

  const { trackUserClickInvitePoster } = useWatchEventTrack();
  trackUserClickInvitePoster();

  const iosVersion = getIosVersion();
  if (iosVersion && iosVersion <= 9) {
    toast.error(translate('base.system.version.deprecated'));
  } else {
    const url = channelMenuStore.seatTableMenuData ? getGenerateSeatPosterUrl() : generatePosterUrl;
    window.location.href = url;
  }
}

export function onClickInvitePosterEntry() {
  redirectToPosterPage();
}
