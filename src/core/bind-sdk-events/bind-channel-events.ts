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
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { appEvents, eventBus } from '@/app/app-events';

export function bindChannelModuleEvents(): void {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
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

    if (failReason === ChannelSetupFailReason.NotAllowDomain) {
      watchAppStore.setPageError({
        type: PageErrorType.UnknownError,
        title: translate('pageError.NotAllowDomain.title'),
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
    channelStore.syncChannelStore();

    if (liveStatus === LiveStatus.End) {
      layoutStore.exitMobileLayoutFullScreen();

      if (channelStore.isSeminarChannel && channelStore.privateSeminarChannel) {
        const socket = watchCore.chat.getSocket(false);
        socket && socket.disconnect();
      }

      return;
    }

    if (liveStatus === LiveStatus.Live) {
      console.info('直播开始');
      if (channelStore.isSeminarChannel && !channelStore.privateSeminarChannel) {
        watchAppStore.setupWatchCoreConnect();
      }
    }
  });

  channelEventEmitter.on(ChannelEvents.SessionIdChange, channelStore.syncChannelStore);

  channelEventEmitter.on(ChannelEvents.SeminarHostJoinInGroup, () => {
    channelStore.$patch({
      isSeminarHostInGroup: true,
    });
  });

  channelEventEmitter.on(ChannelEvents.SeminarHostLeaveGroup, () => {
    channelStore.$patch({
      isSeminarHostInGroup: false,
    });
  });

  channelEventEmitter.on(ChannelEvents.ViewerWatchDuration, ({ duration }) => {
    channelInfoStore.$patch({
      viewerWatchDuration: Math.floor(duration / 60),
    });
  });

  channelEventEmitter.on(ChannelEvents.TransmitDoubleRoomChange, () => {
    eventBus.$emit(appEvents.player.ResetUpPlayer);
    eventBus.$emit(appEvents.doc.ResetUpDoc);
    eventBus.$emit(appEvents.connectMic.ResetUpConnectMic);
  });

  const menuEventEmitter = watchCore.menu.eventEmitter;
  menuEventEmitter.on(MenuEvents.ChannelMenuChange, ChannelMenuStore.syncChannelMenus);
}
