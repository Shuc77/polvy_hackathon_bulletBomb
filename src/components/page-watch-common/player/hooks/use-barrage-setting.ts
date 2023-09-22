/**
 * @file 弹幕设置弹窗 hook
 */
import { computed } from 'vue';
import { translate } from '@/assets/lang';
import { usePlayerStore } from '@/store/use-player-store';
import { isMobile } from '@/assets/utils/browser';
import { usePlayerAction } from './use-player-action';
import { speedBitMap, sizeBitMap, sizeMobileBitMap } from './use-barrage-mapping';

export const useBarrageSetting = () => {
  const { toChangeBarrageSpeed, toChangeBarrageSize } = usePlayerAction();
  const playerStore = usePlayerStore();

  /**
   * 弹幕速度转换为档位值
   */
  const formattedBarrageSpeedToSliderValue = computed(() => {
    return speedBitMap.get(playerStore.barrageSpeed || 200);
  });

  function handleBarrageSpeedChange(value: number) {
    toChangeBarrageSpeed(speedBitMap.get(value));
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

  /**
   * 弹幕速度转换为档位值
   */
  const formattedBarrageSizeToSliderValue = computed(() => {
    const sizeMap = isMobile ? sizeMobileBitMap : sizeBitMap;
    return sizeMap.get(playerStore.barrageSize || 20);
  });

  const formattedBarrageSizeToText = computed(() => {
    const sizeMap = isMobile ? sizeMobileBitMap : sizeBitMap;
    return {
      // 极小（12）、小（16）、标准（20）、大（24）、特大（28）
      1: translate('barrage.size.verySmall'),
      2: translate('barrage.size.small'),
      3: translate('barrage.size.normal'),
      4: translate('barrage.size.big'),
      5: translate('barrage.size.veryBig'),
    }[sizeMap.get(playerStore.barrageSize)];
  });

  /**
   * 切换弹幕字号大小
   * @param value 档位值
   */
  function handleBarrageSizeChange(value: number) {
    const sizeMap = isMobile ? sizeMobileBitMap : sizeBitMap;
    toChangeBarrageSize(sizeMap.get(value));
  }

  /**
   * 恢复弹幕默认设置
   * @desc 弹幕速度&弹幕字号跟随后台默认设置, 弹幕位置恢复到顶部, 弹幕透明度恢复到55%
   */
  function resetAllSetting() {
    handleBarrageSpeedChange(playerStore.barrageSpeedGrade);
    handleBarrageSizeChange(playerStore.barrageSizeGrade);
  }

  return {
    formattedBarrageSpeedToSliderValue,
    formattedBarrageSpeedToText,
    handleBarrageSpeedChange,
    formattedBarrageSizeToSliderValue,
    formattedBarrageSizeToText,
    handleBarrageSizeChange,
    resetAllSetting,
  };
};
