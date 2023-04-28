import { ChannelEvents, MenuEvents } from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';

export function bindChannelModuleEvents(): void {
  const channelStore = useChannelStore();
  const ChannelMenuStore = useChannelMenuStore();

  const watchCore = getWatchCore();
  const channelEventEmitter = watchCore.channel.eventEmitter;

  channelEventEmitter.on(ChannelEvents.LiveStatusChange, channelStore.syncChannelStore);
  channelEventEmitter.on(ChannelEvents.SessionIdChange, channelStore.syncChannelStore);

  const menuEventEmitter = watchCore.menu.eventEmitter;
  menuEventEmitter.on(MenuEvents.ChannelMenuChange, ChannelMenuStore.syncChannelMenus);
}
