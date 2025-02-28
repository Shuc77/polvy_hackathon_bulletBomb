import {
  ChannelEvents,
  ChannelSetupFailReason,
  LiveStatus,
  MenuEvents,
  PolyvWatchCore,
} from '@polyv/live-watch-sdk';

import { useWatchAppStore } from '@/store/use-watch-app-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChannelStore } from '@/store/use-channel-store';
import { PageErrorType } from '@/app/layout/direct-business-page/type';
import { translate } from '@/assets/lang';
import { useLayoutStore } from '@/store/use-layout-store';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { appEvents } from '@/app/app-events';

export function bindChannelModuleEvents(watchCore: PolyvWatchCore): void {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const channelStore = useChannelStore();
  const channelInfoStore = useChannelInfoStore();
  const ChannelMenuStore = useChannelMenuStore();

  // 处理频道模块安装失败
  watchCore.channel.eventEmitter.on(ChannelEvents.ChannelSetupFail, ({ failReason }) => {
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

  watchCore.channel.eventEmitter.on(ChannelEvents.LiveStatusChange, ({ liveStatus }) => {
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
      console.log('直播开始');
      if (channelStore.isSeminarChannel && !channelStore.privateSeminarChannel) {
        watchAppStore.setupWatchCoreConnect();
      }
      const emitter = watchAppStore.getPolyvWatchApp()?.getEmitter();
      if (!emitter) return;

      setTimeout(() => {
        emitter.emit(appEvents.connectMic.ResetUpConnectMic);
      }, 0);
    }
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.SessionIdChange, channelStore.syncChannelStore);

  watchCore.channel.eventEmitter.on(ChannelEvents.SeminarHostJoinInGroup, () => {
    channelStore.$patch({
      isSeminarHostInGroup: true,
    });
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.SeminarHostLeaveGroup, () => {
    channelStore.$patch({
      isSeminarHostInGroup: false,
    });
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.ViewerWatchDuration, ({ duration }) => {
    channelInfoStore.$patch({
      viewerWatchDuration: Math.floor(duration / 60),
    });
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.ManagerBulletinMarquee, ({ enabled }) => {
    channelStore.$patch({
      managerBulletinMarqueeEnabled: enabled,
    });
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.TestModeChange, ({ inTestMode }) => {
    const emitter = watchAppStore.getPolyvWatchApp()?.getEmitter();
    if (!emitter) return;

    // 从非测试模式变成测试模式的情况
    if (inTestMode) {
      setTimeout(() => {
        emitter.emit(appEvents.player.ResetUpPlayer);
        emitter.emit(appEvents.doc.ResetUpDoc);
        emitter.emit(appEvents.connectMic.ResetUpConnectMic);
      }, 0);
      return;
    }

    // 从测试模式变成非测试模式的情况
    if (!inTestMode) {
      setTimeout(() => {
        emitter.emit(appEvents.player.ResetUpPlayer);
        emitter.emit(appEvents.doc.ResetUpDoc);
        emitter.emit(appEvents.connectMic.ResetUpConnectMic);
      }, 3 * 1000);
    }
  });

  watchCore.channel.eventEmitter.on(ChannelEvents.TransmitDoubleRoomChange, () => {
    const emitter = watchAppStore.getPolyvWatchApp()?.getEmitter();
    if (!emitter) return;

    emitter.emit(appEvents.player.ResetUpPlayer);
    emitter.emit(appEvents.doc.ResetUpDoc);
    emitter.emit(appEvents.connectMic.ResetUpConnectMic);
  });

  const menuEventEmitter = watchCore.menu.eventEmitter;
  menuEventEmitter.on(MenuEvents.ChannelMenuChange, ChannelMenuStore.syncChannelMenus);
}
