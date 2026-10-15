/**
 * @file 弹幕 hook
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { usePlayerStore } from '@/store/use-player-store';
import { BarrageTarget } from '@polyv/live-watch-sdk';
import { isRef, onBeforeUnmount, ref, Ref, shallowRef, unref, watch } from 'vue';
import { useBarrageFeed } from './use-barrage-feed';

export const useBarrage = (
  options: {
    containerRef?: HTMLDivElement | Ref<HTMLDivElement | undefined>;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();

  const playerStore = usePlayerStore();
  const containerRef = isRef(options.containerRef)
    ? options.containerRef
    : ref(options.containerRef);

  const barrageTarget = shallowRef<BarrageTarget>();

  const barrageFeed = useBarrageFeed(() => barrageTarget.value);

  /** 设置弹幕 */
  function setupBarrage(): void {
    destroyBarrage();

    const container = unref(containerRef);
    if (!container) {
      return;
    }

    const watchCore = getWatchCore();
    const { direction, percent } =
      playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex];
    barrageTarget.value = watchCore.barrage.setupBarrage({
      container,
      // 关闭 SDK 自动喂送：其内部过滤会丢掉自己发送的消息，回放消息也会被拦截，
      // 改由 useBarrageFeed 从聊天室直接取消息上屏
      autoAdd: false,
      speed: playerStore.barrageSpeed,
      size: playerStore.barrageSize,
      alpha: playerStore.barrageAlpha,
      areaDirection: direction,
      areaPercentage: percent,
    });

    barrageFeed.start();
  }

  /** 销毁弹幕 */
  function destroyBarrage(): void {
    barrageFeed.stop();

    if (barrageTarget.value) {
      barrageTarget.value.destroyTarget();
      barrageTarget.value = undefined;
    }
  }

  /** 修改弹幕速度 */
  function changeBarrageSpeed(speed: number) {
    barrageTarget.value?.changeSpeed(speed);
  }

  /** 修改弹幕字号 */
  function changeBarrageSize(size: number) {
    barrageTarget.value?.changeSize(size);
  }

  /** 修改弹幕透明度 */
  function changeBarrageAlpha(alpha: number) {
    barrageTarget.value?.changeAlpha(alpha);
  }

  /** 修改弹幕位置 */
  function changeBarrageLocation(index: number) {
    barrageTarget.value?.changeLocation(index);
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
    () => playerStore.barrageSize,
    () => {
      changeBarrageSize(playerStore.barrageSize);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => playerStore.barrageAlpha,
    () => {
      changeBarrageAlpha(playerStore.barrageAlpha);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => playerStore.currentBarrageLocationIndex,
    () => {
      changeBarrageLocation(playerStore.currentBarrageLocationIndex);
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
    /** 当前弹幕对象，供特效层做尺寸校正、节点接管等操作 */
    barrageTarget,
    setupBarrage,
    destroyBarrage,
  };
};
