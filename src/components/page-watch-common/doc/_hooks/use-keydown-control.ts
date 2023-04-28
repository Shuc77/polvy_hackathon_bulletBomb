import { KeyCodeMap } from '@/assets/constants/key-code';
import { getWatchCore } from '@/core/watch-sdk';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { MainScreenContent } from '@polyv/live-watch-sdk';
import { onBeforeUnmount, watchEffect } from 'vue';

/**
 * 文档键盘控制 hook
 */
export const useDocKeydownControl = () => {
  const layoutStore = useLayoutStore();
  const playbackStore = usePlaybackStore();

  function onKeydownEvent(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    if (layoutStore.mainScreen !== MainScreenContent.Doc) {
      return;
    }

    const watchCore = getWatchCore();

    if (keyCode === KeyCodeMap.ArrowLeft) {
      watchCore.doc.gotoPrev();
      return;
    }

    if (keyCode === KeyCodeMap.ArrowRight) {
      watchCore.doc.gotoNext();
    }
  }

  function listenEvent() {
    removeListenEvent();
    window.addEventListener('keydown', onKeydownEvent);
  }

  function removeListenEvent() {
    window.addEventListener('keydown', onKeydownEvent);
  }

  watchEffect(() => {
    if (playbackStore.isPlaybacking) {
      listenEvent();
    } else {
      removeListenEvent();
    }
  });

  onBeforeUnmount(() => {
    removeListenEvent();
  });
};
