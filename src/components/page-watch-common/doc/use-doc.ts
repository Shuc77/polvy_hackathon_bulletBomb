import { getWatchCore } from '@/core/watch-sdk';
import { useChannelStore } from '@/store/use-channel-store';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { DocEvents, LiveStatus, SetupDocOptions } from '@polyv/live-watch-sdk';
import { useLayoutStore } from '@/store/use-layout-store';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useDocStore } from '@/store/use-doc-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { MessageBoxInstance } from '@/components/common-base/message-box';
import { toast } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useLangStore } from '@/store/use-lang-store';

export const useDoc = (
  useOptions: {
    setupOptions?: Partial<SetupDocOptions>;
  } = {},
) => {
  const docStore = useDocStore();
  const channelStore = useChannelStore();
  const layoutStore = useLayoutStore();
  const playbackStore = usePlaybackStore();
  const langStore = useLangStore();

  /** 创建文档的外层节点 */
  const wrapRef = ref<HTMLDivElement>();

  const confirmRef = ref<MessageBoxInstance>();

  /** 初始化文档 */
  async function initDoc() {
    const { setupOptions = {} } = useOptions;
    const wrapElem = unref(wrapRef);
    if (!wrapElem) return;

    if (!docStore.docEnabled) return;

    const watchCore = getWatchCore();
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

    listenDocEvent();
  }

  function listenDocEvent() {
    unlistenDocEvent();
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.on(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  function unlistenDocEvent() {
    const watchCore = getWatchCore();
    watchCore.doc.eventEmitter.off(DocEvents.FullScreenStateChange, onFullScreenStateChange);
  }

  function onFullScreenStateChange(evt: { isFullScreen: boolean }) {
    layoutStore.$patch({
      mobileDocIsPageFullscreen: evt.isFullScreen,
    });
  }

  watch(
    () => langStore.currentLang,
    () => {
      const watchCore = getWatchCore();
      watchCore.doc.switchLang(langStore.currentLang);
    },
  );

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
    () => [layoutStore.mainScreen, layoutStore.mobileDocIsPageFullscreen],
    async () => {
      await nextTick();
      const watchCore = getWatchCore();
      watchCore.doc.resize();
    },
  );

  onBeforeUnmount(() => {
    unlistenDocEvent();
  });

  return {
    wrapRef,
    confirmRef,
    emptyPlaceholderVisible,
  };
};
