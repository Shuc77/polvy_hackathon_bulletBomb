import {
  ChannelEvents,
  ChannelSetupFailReason,
  LiveStatus,
  MenuEvents,
} from '@polyv/live-watch-sdk';
import { getWatchCore } from '@/core/watch-sdk';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { PageErrorType } from '@/app/layout/page-error/page-error-type';
import { translate } from '@/assets/lang';
import { useLayoutStore } from '@/store/use-layout-store';

export function bindChannelModuleEvents(): void {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const channelStore = useChannelStore();
  const ChannelMenuStore = useChannelMenuStore();

  const watchCore = getWatchCore();
  const channelEventEmitter = watchCore.channel.eventEmitter;

  // 处理频道模块安装失败
  channelEventEmitter.on(ChannelEvents.ChannelSetupFail, ({ failReason }) => {
    if (failReason === ChannelSetupFailReason.NetworkError) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        title: translate('pageError.network.general.title'),
        desc: translate('pageError.network.general.desc'),
        reloadBtnVisible: true,
      });
      return;
    }

    if (failReason === ChannelSetupFailReason.NetworkRequestTimeout) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        title: translate('pageError.network.timeout.title'),
        desc: translate('pageError.network.general.desc'),
        reloadBtnVisible: true,
      });
      return;
    }

    watchAppStore.setPageError({
      type: PageErrorType.UnknownError,
      title: translate('pageError.channel.unknowError'),
      desc: translate('pageError.channel.feedBack'),
      reloadBtnVisible: true,
    });
  });

  channelEventEmitter.on(ChannelEvents.LiveStatusChange, ({ liveStatus }) => {
    if (liveStatus === LiveStatus.End) {
      layoutStore.exitMobileLayoutFullScreen();
    }
    channelStore.syncChannelStore();
  });
  channelEventEmitter.on(ChannelEvents.SessionIdChange, channelStore.syncChannelStore);

  const menuEventEmitter = watchCore.menu.eventEmitter;
  menuEventEmitter.on(MenuEvents.ChannelMenuChange, ChannelMenuStore.syncChannelMenus);
}
