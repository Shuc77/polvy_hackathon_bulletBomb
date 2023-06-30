/**
 * @file 弹幕 hook
 */
import { getWatchCore } from '@/core/watch-sdk';
import { usePlayerStore } from '@/store/use-player-store';
import { BarrageTarget } from '@polyv/live-watch-sdk';
import { isRef, onBeforeUnmount, ref, Ref, unref, watch } from 'vue';

export const useBarrage = (
  options: {
    containerRef?: HTMLDivElement | Ref<HTMLDivElement | undefined>;
  } = {},
) => {
  const playerStore = usePlayerStore();
  const containerRef = isRef(options.containerRef)
    ? options.containerRef
    : ref(options.containerRef);
  let barrageTarget: BarrageTarget | undefined;

  /** 设置弹幕 */
  function setupBarrage(): void {
    destroyBarrage();

    const container = unref(containerRef);
    if (!container) {
      return;
    }

    const watchCore = getWatchCore();
    barrageTarget = watchCore.barrage.setupBarrage({
      container,
      speed: playerStore.barrageSpeed,
    });
  }

  /** 销毁弹幕 */
  function destroyBarrage(): void {
    if (barrageTarget) {
      barrageTarget.destroyTarget();
      barrageTarget = undefined;
    }
  }

  /** 修改弹幕速度 */
  function changeBarrageSpeed(speed: number) {
    barrageTarget?.changeSpeed(speed);
  }

  watch(
    () => playerStore.barrageSpeed,
    () => {
      changeBarrageSpeed(playerStore.barrageSpeed);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => [playerStore.barrageSetting.barrageEnabled, playerStore.barrageShow, containerRef.value],
    () => {
      if (!playerStore.barrageSetting.barrageEnabled || !playerStore.barrageShow) {
        destroyBarrage();
        return;
      }

      setupBarrage();
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    destroyBarrage();
  });

  return {
    containerRef,
    setupBarrage,
    destroyBarrage,
    changeBarrageSpeed,
  };
};
