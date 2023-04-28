import { isMobile } from '@/assets/utils/browser';
import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import {
  ChannelDocWatchLayout,
  DocEvents,
  LiveStatus,
  MainScreenContent,
} from '@polyv/live-watch-sdk';
import { onBeforeUnmount, onMounted } from 'vue';

/**
 * 主副屏切换响应逻辑
 */
export const useMainScreen = () => {
  const channelStore = useChannelStore();
  const docStore = useDocStore();
  const layoutStore = useLayoutStore();

  /** ------ 默认位置 ------ */
  /**
   * 设置 PC 端默认位置
   */
  function setPcDefaultMainScreen() {
    const docWatchLayout = channelStore.channelDetail?.theme.watchLayout;

    if (!docStore.canRenderDoc || !docWatchLayout) {
      return;
    }

    switch (docWatchLayout) {
      case ChannelDocWatchLayout.Video:
      case ChannelDocWatchLayout.OnlyVideo:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Player,
        });
        break;
      case ChannelDocWatchLayout.FollowTeacher:
      case ChannelDocWatchLayout.Ppt:
        layoutStore.$patch({
          mainScreen: MainScreenContent.Doc,
        });
        break;
    }
  }

  if (!isMobile) {
    setPcDefaultMainScreen();
  }

  /** ------ 事件响应 ------ */
  function onMainScreenChange(evt: { mainScreen: MainScreenContent }) {
    const docWatchLayout = channelStore.channelDetail?.theme.watchLayout;

    if (!docStore.canRenderDoc || !docWatchLayout) {
      return;
    }

    // 针对移动端，如果后台设置非跟随讲师，则不处理事件
    if (
      isMobile &&
      docWatchLayout !== ChannelDocWatchLayout.FollowTeacher &&
      channelStore.liveStatus === LiveStatus.Live
    ) {
      return;
    }

    layoutStore.$patch({
      mainScreen: evt.mainScreen,
    });
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.on(DocEvents.MainScreenChange, onMainScreenChange);
  });

  onBeforeUnmount(() => {
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.off(DocEvents.MainScreenChange, onMainScreenChange);
  });
};
