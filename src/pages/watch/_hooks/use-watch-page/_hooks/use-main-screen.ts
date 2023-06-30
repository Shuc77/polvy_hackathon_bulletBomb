import { isMobile } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  MainScreenLayoutMode,
  ChannelPlayMode,
  DocEvents,
  DocEventsRelations,
  LiveStatus,
  MainScreenContent,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted, watch } from 'vue';

/**
 * 主副屏切换响应逻辑
 */
export const useMainScreen = () => {
  const channelStore = useChannelStore();
  const docStore = useDocStore();
  const layoutStore = useLayoutStore();

  /**
   * 设置 PC 端默认位置
   */
  function setPcDefaultMainScreen() {
    const mainScreenLayoutMode = layoutStore.mainScreenLayoutMode;

    if (!docStore.canRenderDoc) {
      return;
    }

    const watchCore = getWatchCore();
    const playMode = watchCore.channel.getChannelPlayMode();
    // 如果需要暖场，需要将主屏设置为播放器
    if (playMode === ChannelPlayMode.Warm && channelStore.liveStatus !== LiveStatus.Live) {
      layoutStore.$patch({
        mainScreen: MainScreenContent.Player,
      });
      return;
    }

    switch (mainScreenLayoutMode) {
      case MainScreenLayoutMode.FollowTeacher:
      case MainScreenLayoutMode.Ppt:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Doc,
        });
        break;
      case MainScreenLayoutMode.Video:
      case MainScreenLayoutMode.OnlyVideo:
      default:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Player,
        });
        break;
    }
  }

  function initMainScreen() {
    if (!isMobile) {
      setPcDefaultMainScreen();
    }
  }

  /** ------ 事件响应 ------ */

  watch(
    () => channelStore.liveStatus,
    (newVal, oldVal) => {
      if (oldVal && newVal === LiveStatus.Live) {
        initMainScreen();
      }
    },
  );

  function onMainScreenChange(evt: DocEventsRelations[DocEvents.MainScreenChange]) {
    const mainScreenLayoutMode = layoutStore.mainScreenLayoutMode;

    if (!docStore.canRenderDoc) {
      return;
    }

    // 针对移动端，如果后台设置非跟随讲师，则不处理事件
    if (
      isMobile &&
      mainScreenLayoutMode !== MainScreenLayoutMode.FollowTeacher &&
      channelStore.liveStatus === LiveStatus.Live
    ) {
      return;
    }

    layoutStore.$patch({
      mainScreen: evt.mainScreen,
    });
  }

  onMounted(() => {
    initMainScreen();

    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.on(DocEvents.MainScreenChange, onMainScreenChange);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.off(DocEvents.MainScreenChange, onMainScreenChange);
  });
};
