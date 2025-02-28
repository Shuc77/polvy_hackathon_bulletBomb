import { useChannelStore } from '@/store/use-channel-store';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { DocEvents, LiveStatus, SetupDocOptions } from '@polyv/live-watch-sdk';
import { useLayoutStore } from '@/store/use-layout-store';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useDocStore } from '@/store/use-doc-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { MessageBoxInstance } from '@/components/common-base/message-box';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

export const useDoc = (
  useOptions: {
    setupOptions?: Partial<SetupDocOptions>;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  const { toast } = useToastManager();

  const docStore = useDocStore();
  const channelStore = useChannelStore();
  const layoutStore = useLayoutStore();
  const playbackStore = usePlaybackStore();
  const webviewStore = useWebviewStore();

  /** 创建文档的外层节点 */
  const wrapRef = ref<HTMLDivElement>();

  const confirmRef = ref<MessageBoxInstance>();

  const docSetupFinished = ref(false);

  /** 初始化文档 */
  async function initDoc() {
    const { setupOptions = {} } = useOptions;
    const wrapElem = unref(wrapRef);
    if (!wrapElem) return;

    if (!docStore.docEnabled) return;

    docSetupFinished.value = false;

    await watchCore.doc.setupDoc({
      container: wrapElem,
      keyboardEnabled: !playbackStore.isPlaybacking,
      beforeClear: async () => {
        if (confirmRef.value) {
          const result = await confirmRef.value.$confirm();
          if (!result) {
            return Promise.reject(new Error());
          }
          toast.success(translate('base.deleteSuccess'));
        }
      },
      ...setupOptions,
    });

    docSetupFinished.value = true;

    listenDocEvent();
  }

  function listenDocEvent() {
    unlistenDocEvent();
    watchCore.doc.eventEmitter.on(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  function unlistenDocEvent() {
    watchCore.doc.eventEmitter.off(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  function onFullScreenStateChange(evt: { isFullScreen: boolean }) {
    layoutStore.$patch({
      mobileDocIsPageFullscreen: evt.isFullScreen,
    });
  }

  useEventBusListener(appEvents.doc.ResetUpDoc, () => {
    initDoc();
  });

  onMounted(() => {
    initDoc();
  });

  /** 暂无直播状态是否显示 */
  const emptyPlaceholderVisible = computed<boolean>(() => {
    if (
      [LiveStatus.UnStart, LiveStatus.End, LiveStatus.Waiting].includes(channelStore.liveStatus)
    ) {
      return true;
    }

    return false;
  });

  watch(
    () => [
      layoutStore.mainScreen,
      layoutStore.mobileDocIsPageFullscreen,
      webviewStore.isSmallWindow,
    ],
    async (next, prev) => {
      await nextTick();
      // 小窗事件结束不一定这么快
      const timeout = next[2] !== prev[2] ? 300 : 0;
      setTimeout(() => {
        watchCore.doc.resize();
      }, timeout);
    },
  );

  onBeforeUnmount(() => {
    unlistenDocEvent();
  });

  return {
    docSetupFinished,

    wrapRef,
    confirmRef,
    emptyPlaceholderVisible,
  };
};
