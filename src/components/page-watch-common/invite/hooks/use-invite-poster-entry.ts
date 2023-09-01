/** @file 邀请海报入口 hook 钩子 */

import { getIosVersion } from '@/assets/utils/browser';
import { useInviteStore } from '@/store/use-invite-store';
import { toast } from '@/hooks/components/use-toast';
import { useWatchEventTrack } from '@/hooks/business/use-watch-event-track';
import { translate } from '@/assets/lang';

export function redirectToPosterPage() {
  const { trackUserClickInvitePoster } = useWatchEventTrack();
  const { generatePosterUrl } = useInviteStore();

  trackUserClickInvitePoster();

  const iosVersion = getIosVersion();
  if (iosVersion && iosVersion <= 9) {
    toast.error(translate('base.system.version.deprecated'));
  } else {
    window.location.href = generatePosterUrl;
  }
}
