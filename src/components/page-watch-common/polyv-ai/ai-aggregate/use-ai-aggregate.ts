import { usePlayerAction } from '../../player/hooks/use-player-action';
import { useAIPlaybackOutline } from '../hooks/use-ai-playback-outline';
import { useAISubtitleList } from '../hooks/use-ai-subtitle-list';
import { useAIPlaybackQuestion } from '../hooks/use-ai-playback-question';
import { computed } from 'vue';

export const useAIAggregate = () => {
  const { toSeekVideo } = usePlayerAction();

  // 大纲数据
  const { outlineUrl, outlineData, aiOutlineEnabled } = useAIPlaybackOutline();

  // 逐字稿数据
  const { srtUrl, srtData, aiSubtitleListEnabled } = useAISubtitleList();

  // 答题数据
  const { questionUrl, questionData, aiKnowledgeQuizEnabled } = useAIPlaybackQuestion();

  function onSeekVideo(time: number) {
    toSeekVideo(time);
  }

  const tabEnabledSetting = computed(() => {
    return {
      outlineEnabled: !!(aiOutlineEnabled.value && outlineUrl.value),
      subtitleEnabled: !!(aiSubtitleListEnabled.value && srtUrl.value),
      questionEnabled: !!(aiKnowledgeQuizEnabled.value && questionUrl.value),
    };
  });

  return {
    tabEnabledSetting,

    outlineData,
    srtData,
    questionData,

    onSeekVideo,
  };
};
