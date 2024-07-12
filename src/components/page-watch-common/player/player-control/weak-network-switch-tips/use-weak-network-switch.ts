import { getWatchCore } from '@/core/watch-sdk';
import { PlayerEvents } from '@polyv/live-watch-sdk';
import { ref, computed } from 'vue';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';

export function useWeakNetworkSwitch() {
  const isLowestQuality = ref(false);
  const isMultiLine = ref(false);
  const isMultiQuality = ref(false);
  const isShowChangeLine = computed(() => {
    return isLowestQuality.value && isMultiLine.value;
  });
  const isShowChangeQuality = computed(() => {
    return !isLowestQuality.value && isMultiQuality.value;
  });

  const { toChangeQualityLevel, toChangeLine } = usePlayerAction();

  /** 是否显示弱网提示 */
  const showWeakNetworkTip = ref(false);
  let lastShown = 0;
  const showWeakNetworkOnce = () => {
    const now = Date.now();

    // 30分钟（1800000毫秒）内只显示一次
    if (!lastShown || now - lastShown > 1800000) {
      showWeakNetworkTip.value = true;
      lastShown = now;

      // 3s后隐藏
      setTimeout(() => {
        showWeakNetworkTip.value = false;
      }, 3000);
    }
  };

  const closeNetworkTips = () => {
    showWeakNetworkTip.value = false;
  };

  const handleQualityChange = () => {
    closeNetworkTips();
  };

  const handleLineChange = () => {
    closeNetworkTips();
    updateValue();
  };

  function updateValue() {
    const playerModule = getWatchCore().player;
    const currLevel = playerModule.getCurrentQualityLevel();
    const lineCount = playerModule.getLineCount();
    const qualityLevels = playerModule.getQualityLevels();

    const lowestQuality =
      qualityLevels.find(item => {
        return item.level === -1;
      })?.level === -1
        ? -1
        : 0;

    isLowestQuality.value = currLevel === lowestQuality;
    isMultiLine.value = lineCount > 1;
    isMultiQuality.value = qualityLevels.length > 1;
  }

  const updateWeakNetworkTips = () => {
    const playerModule = getWatchCore().player;
    updateValue();

    playerModule.eventEmitter.off(PlayerEvents.LineChange, handleLineChange);
    playerModule.eventEmitter.off(PlayerEvents.QualityLevelChange, handleQualityChange);
    playerModule.eventEmitter.on(PlayerEvents.LineChange, handleLineChange);
    playerModule.eventEmitter.on(PlayerEvents.QualityLevelChange, handleQualityChange);
  };

  const switchNextQuality = () => {
    const playerModule = getWatchCore().player;
    const currentQualityLevel = playerModule.getCurrentQualityLevel();
    const qualityLevels = playerModule.getQualityLevels();

    const lowestQuality =
      qualityLevels.find(item => {
        return item.level === -1;
      })?.level === -1
        ? -1
        : 0;

    if (currentQualityLevel > lowestQuality) {
      toChangeQualityLevel(currentQualityLevel - 1);
    }
  };

  const switchNextLine = () => {
    const playerModule = getWatchCore().player;
    const lineCount = playerModule.getLineCount();
    const currentLine = playerModule.getCurrentLine();

    if (lineCount > 1) {
      const nextLine = currentLine > 0 ? currentLine - 1 : lineCount - 1;
      toChangeLine(nextLine);
    }
  };

  return {
    isLowestQuality,
    isMultiLine,
    isShowChangeLine,
    isShowChangeQuality,
    isMultiQuality,
    showWeakNetworkTip,

    updateWeakNetworkTips,
    switchNextQuality,
    switchNextLine,
    showWeakNetworkOnce,
    closeNetworkTips,
  };
}
