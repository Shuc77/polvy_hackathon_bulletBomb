import { getWatchCore } from '@/core/watch-sdk';
import { useInviteStore } from '@/store/use-invite-store';
import { InviteEvents } from '@polyv/live-watch-sdk';

export function bindInviteEvents() {
  const inviteStore = useInviteStore();
  const watchCore = getWatchCore();

  watchCore.invite.eventEmitter.on(InviteEvents.InviteUserInfoUpdate, inviteStore.syncInviteInfo);
}
