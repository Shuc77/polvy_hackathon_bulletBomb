import { translate } from '@/assets/lang';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useToastManager } from '@/hooks/components/use-toast';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { ConnectMicStatus } from '@polyv/live-watch-sdk';
import { setActivePinia } from 'pinia';
import { watch } from 'vue';
import { appEvents, useEventBusListener } from '../app-events';
import { useBrowserIcon, useBrowserTitle } from './use-global-style';
import { usePlayerStore } from '@/store/use-player-store';

const useExternalContainerEffectMain = () => {
  const watchAppStore = useWatchAppStore();
  const playerStore = usePlayerStore();

  const { getPolyvWatchApp, getSocket } = watchAppStore;

  const { setBrowserIcon } = useBrowserIcon();
  const { setBrowserTitle } = useBrowserTitle();

  const { forcePausePlay, toFreezePlay, toPlay } = usePlayerAction();

  function toSetActivePinia() {
    const plvWatchApp = getPolyvWatchApp();
    if (plvWatchApp) {
      setActivePinia(plvWatchApp.getVueInstance().$pinia);
    }
  }

  if (watchAppStore.isPageActive) {
    toSetActivePinia();
  }

  useEventBusListener(appEvents.global.PageActive, () => {
    toSetActivePinia();
    watchAppStore.$patch({ isPageActive: true });
    watchAppStore.getWatchCore().unFreeze();

    setBrowserIcon();
    setBrowserTitle();

    setTimeout(() => {
      if (playerStore.playerInited) {
        toFreezePlay(false);
        toPlay();
      }
    }, 100);

    if (!watchAppStore.isLiveWatchConnected) {
      watchAppStore.recoverActivePageConnect();
      return;
    }

    getSocket()?.connect();
  });

  useEventBusListener(appEvents.global.PageInactive, () => {
    watchAppStore.$patch({ isPageActive: false });
    watchAppStore.getWatchCore().freeze();

    forcePausePlay({ onceHiddenPlayButton: true });
    getSocket()?.disconnect();
  });
};

const useExternalContainerEffectForDrag = () => {
  const watchAppStore = useWatchAppStore();

  const { toast } = useToastManager();

  const connectMicStore = useConnectMicStore();
  const layoutStore = useLayoutStore();

  function getConnectMicDragDisable() {
    return [
      ConnectMicStatus.Applying,
      ConnectMicStatus.Connected,
      ConnectMicStatus.Publishing,
    ].includes(connectMicStore.connectMicStatus);
  }

  watch(
    () => [
      connectMicStore.connectMicStatus,
      layoutStore.isFullscreen,
      layoutStore.mobileDocIsPageFullscreen,
      layoutStore.mobilePlayerIsPageFullscreen,
    ],
    () => {
      if (!watchAppStore.isPageActive) {
        return;
      }

      const dragDisabled =
        getConnectMicDragDisable() ||
        layoutStore.isFullscreen ||
        layoutStore.mobileDocIsPageFullscreen ||
        layoutStore.mobilePlayerIsPageFullscreen;

      if (dragDisabled) {
        watchAppStore.toLockDrag('external-container-dragDisabled');
      } else {
        watchAppStore.toUnlockDrag();
      }
    },
  );

  useEventBusListener(appEvents.global.PageSlideForbidden, () => {
    const dragDisabled = getConnectMicDragDisable();

    if (dragDisabled) {
      toast.info(translate('global.pageSlideForbidden.tips.connectMic'));
    } else {
      toast.info('当前不支持切换页面');
    }
  });
};

const useExternalContainerEffectForFeed = () => {
  const feedInjectStore = useFeedInjectStore();

  useEventBusListener(appEvents.global.ToSwitchFeedLayoutLevel, ({ level }) => {
    feedInjectStore.switchFeedLayout(level);
  });
};

/**
 * 外部容器副作用处理
 */
export const useExternalContainerEffect = () => {
  useExternalContainerEffectMain();
  useExternalContainerEffectForDrag();
  useExternalContainerEffectForFeed();
};
