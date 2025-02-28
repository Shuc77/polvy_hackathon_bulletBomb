import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { ref, watch } from 'vue';
import { usePlayerAction } from '../player/hooks/use-player-action';
import { usePlaybackStore } from '@/store/use-playback-store';
import { OutlineContentItem } from '@polyv/live-watch-sdk';

/**
 * AI 看 hook
 * @hook
 */
export const useAISummary = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();
  const { toSeekVideo } = usePlayerAction();

  const playbackStore = usePlaybackStore();

  const isUnFold = ref(false);

  const outlineContent = ref<OutlineContentItem[]>([]);

  const introduction = ref('');

  const outlineType = ref<'init' | 'null' | 'finish'>('null');

  function handleUnFold() {
    isUnFold.value = !isUnFold.value;
  }

  function handleMinMapPreview() {
    getEmitter().emit(appEvents.global.OpenPlaybackOutlineDialog, {
      outlineContent: outlineContent.value,
    });
  }

  function handleSeekVideo(startTime: string) {
    if (startTime === '00:00:00') {
      toSeekVideo(0);
      return;
    }

    const timeToSeconds = (timeStr: string) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      return h * 3600 + m * 60 + s;
    };

    toSeekVideo(timeToSeconds(startTime));
  }

  /**
   * 获取 AI 回放大纲
   */
  async function getOutlineData() {
    const playbackTarget = playbackStore.currentPlaybackTarget;
    if (!playbackTarget || !playbackTarget?.outline?.outlineUrl) {
      outlineContent.value = [];
      outlineType.value = 'null';
      return;
    }

    const watchCore = getWatchCore();
    const data = await watchCore.playback.getOutlineList(playbackTarget?.outline?.outlineUrl);
    introduction.value = data.introduction;
    outlineContent.value = data.outlineContent.map(item => {
      return {
        ...item,
        startTime: item.startTime.split(',')[0],
        summary: item.summary.map((item, index) => {
          return index + 1 + '. ' + item;
        }, []),
      };
    });
    if (!introduction.value && outlineContent.value.length <= 0) {
      outlineType.value = 'init';
    } else {
      outlineType.value = 'finish';
    }
  }

  watch(
    () => playbackStore.currentPlaybackTarget,
    () => {
      getOutlineData();
    },
    {
      immediate: true,
    },
  );

  return {
    outlineType,
    isUnFold,
    introduction,
    outlineContent,

    handleUnFold,
    handleMinMapPreview,
    handleSeekVideo,
  };
};
