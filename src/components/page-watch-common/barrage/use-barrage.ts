/**
 * @file 弹幕 hook
 */
import { getWatchCore } from '@/core/watch-sdk';
import { usePlayerStore } from '@/store/use-player-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { BarrageTarget } from '@polyv/live-watch-sdk';
import { isRef, onBeforeUnmount, ref, Ref, unref, watchEffect } from 'vue';

export const useBarrage = (
  options: {
    containerRef?: HTMLDivElement | Ref<HTMLDivElement | undefined>;
  } = {},
) => {
  const { barrageBackstageEnabled, barrageShow } = storeDefinitionToRefs(usePlayerStore);
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
    });
  }

  /** 销毁弹幕 */
  function destroyBarrage(): void {
    if (barrageTarget) {
      barrageTarget.destroyTarget();
      barrageTarget = undefined;
    }
  }

  watchEffect(() => {
    if (!unref(barrageBackstageEnabled) || !unref(barrageShow)) {
      destroyBarrage();
      return;
    }

    setupBarrage();
  });

  onBeforeUnmount(() => {
    destroyBarrage();
  });

  return {
    containerRef,
    setupBarrage,
    destroyBarrage,
  };
};
