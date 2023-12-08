import { useInviteStore } from '@/store/use-invite-store';
import { InviteEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '../watch-sdk';

export function bindInviteModuleEvents(): void {
  const watchCore = getWatchCore();
  const inviteStore = useInviteStore();

  watchCore.invite.eventEmitter.on(InviteEvents.InviteActivityInfoChange, () => {
    inviteStore.syncInviteActivityInfo();
  });
}
