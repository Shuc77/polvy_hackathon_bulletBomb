/**
 * @file 工作台状态编排
 * @desc 播放时间、跳转、导入导出的落点。只应在工作台外壳里调用一次，
 *   面板一律通过 props / emits 与之通信，避免各自持有一份 optimisticTime 而互相看不见。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { PlayStatus } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { useBarrageEffectStore } from '@/store/use-barrage-effect-store';
import { usePlayerStore } from '@/store/use-player-store';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import type { ImportAnchorsResult } from '@/store/use-barrage-effect-store';
import type { EffectTemplateName } from '../types';

/** 导入结果。只给 `importAnchors` 用，别名是为了让调用方不必认识 store 的内部形状 */
export type ImportResult = ImportAnchorsResult;

/** 播放器时钟追上本地乐观值的容差，单位：秒 */
const OPTIMISTIC_TOLERANCE = 0.6;

/**
 * 乐观值的兜底释放时间，单位：毫秒
 * @desc 播放器时间 500ms 一跳，留一拍余量。没有它的话，「跳到当前位置附近」这种
 *   不改变 store 值的 seek 会让乐观值永远交不回去，播放头从此定住不动。
 */
const OPTIMISTIC_TIMEOUT = 800;

export const useWorkbenchState = () => {
  const { getWatchCore } = useGlobalInject();
  const barrageEffectStore = useBarrageEffectStore();
  const playerStore = usePlayerStore();
  const { toTogglePlay, toPause } = usePlayerAction();

  const ioText = ref('');

  /**
   * 时间轴是否可用
   * @desc 判据是运行时的 durationTime，不是 URL 类型 —— 回放地址在 VOD 元数据加载完之前照样不能 seek
   */
  const isTimeAxisAvailable = computed(() => playerStore.durationTime > 0);

  const duration = computed(() => (isTimeAxisAvailable.value ? playerStore.durationTime : 0));

  /** seek 后本地的乐观播放头位置 */
  const optimisticTime = ref<number>();
  let optimisticTimer: ReturnType<typeof setTimeout> | undefined;

  function releaseOptimisticTime(): void {
    optimisticTime.value = undefined;

    if (optimisticTimer !== undefined) {
      clearTimeout(optimisticTimer);
      optimisticTimer = undefined;
    }
  }

  function holdOptimisticTime(time: number): void {
    optimisticTime.value = time;

    if (optimisticTimer !== undefined) {
      clearTimeout(optimisticTimer);
    }

    optimisticTimer = setTimeout(releaseOptimisticTime, OPTIMISTIC_TIMEOUT);
  }

  const currentTime = computed(() => optimisticTime.value ?? playerStore.currentTime);

  const isPlaying = computed(() => playerStore.playStatus === PlayStatus.Playing);

  /**
   * 播放 / 暂停
   * @desc 走仓库自己的动作而不是直接调 `player.play()`：`toTogglePlay` 里有
   *   「未初始化 / 不允许操作 / 连麦中」几道闸门，绕过去会在连麦场景造成重音
   */
  function togglePlay(): void {
    toTogglePlay();
  }

  /**
   * 暂停
   * @desc 工作台打开、开始拖时间轴时用。走的是播放器自己的动作，
   *   和 `togglePlay` 一样保留「未初始化 / 不允许操作」几道闸门
   */
  function pause(): void {
    toPause();
  }

  watch(
    () => playerStore.currentTime,
    storeTime => {
      // 播放器时钟追上来了，交还权威值
      if (
        optimisticTime.value !== undefined &&
        Math.abs(storeTime - optimisticTime.value) <= OPTIMISTIC_TOLERANCE
      ) {
        releaseOptimisticTime();
      }
    },
  );

  onBeforeUnmount(releaseOptimisticTime);

  /**
   * 跳转到指定时间
   * @desc `seekVideo` 内部会把自己的时间夹到 durationTime 以内，而直播下 durationTime 恒为 0，
   *   任何一次误调都会把直播倒回开头 —— 所以这里必须先拦住。
   */
  function seek(time: number): void {
    if (!isTimeAxisAvailable.value) {
      return;
    }

    const target = Math.min(Math.max(time, 0), duration.value);

    getWatchCore().player.seekVideo(target);
    holdOptimisticTime(target);
  }

  /** 新建锚点并选中它 */
  function insertAnchorAt(time: number, template: EffectTemplateName): void {
    const anchor = barrageEffectStore.addAnchorAt(time, template);
    barrageEffectStore.selectAnchor(anchor.id);
  }

  function exportAnchors(): void {
    ioText.value = barrageEffectStore.exportAnchors();
  }

  /**
   * 导入配置文本
   * @desc ★ 返回的是两个数而不是一个布尔值。以前是 `boolean`，于是「10 条里进来了 3 条」
   *   和「全都进来了」在调用方看来完全一样，那句「导入成功」也就一起把丢掉的 7 条瞒了过去
   */
  function importAnchors(): ImportResult {
    const result = barrageEffectStore.importAnchors(ioText.value);

    if (result.imported === 0) {
      return result;
    }

    ioText.value = '';

    return result;
  }

  function resetAll(): void {
    barrageEffectStore.resetAll();
    ioText.value = '';
  }

  return {
    ioText,
    isTimeAxisAvailable,
    duration,
    currentTime,
    isPlaying,

    togglePlay,
    pause,
    seek,
    insertAnchorAt,
    exportAnchors,
    importAnchors,
    resetAll,
  };
};
