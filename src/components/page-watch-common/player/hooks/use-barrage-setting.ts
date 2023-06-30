/**
 * @file 弹幕设置弹窗 hook
 */
import { computed } from 'vue';
import { translate } from '@/assets/lang';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerAction } from './use-player-action';

export const useBarrageSetting = () => {
  const { toChangeBarrageSpeed } = usePlayerAction();
  const playerStore = usePlayerStore();
  const formattedBarrageSpeedToSliderValue = computed(() => {
    type SpeedMap = {
      [key: number]: number;
    };
    const map: SpeedMap = {
      340: 1,
      270: 2,
      200: 3,
      130: 4,
      60: 5,
    };
    return map[playerStore.barrageSpeed] || map[200];
  });
  function formatSliderValueToSpeed(value: number) {
    return {
      1: 340,
      2: 270,
      3: 200,
      4: 130,
      5: 60,
    }[value];
  }
  function handleBarrageSpeedChange(value: number) {
    const speed = formatSliderValueToSpeed(value) as number;
    toChangeBarrageSpeed(speed);
  }

  const formattedBarrageSpeedToText = computed(() => {
    return {
      // 缓慢（340）、较慢（270）、标准（200）、较快（130）、快速（60）
      340: translate('barrage.speed.verySlow'),
      270: translate('barrage.speed.slow'),
      200: translate('barrage.speed.normal'),
      130: translate('barrage.speed.fast'),
      60: translate('barrage.speed.veryFast'),
    }[playerStore.barrageSpeed];
  });

  return {
    formattedBarrageSpeedToSliderValue,
    formattedBarrageSpeedToText,
    handleBarrageSpeedChange,
  };
};
