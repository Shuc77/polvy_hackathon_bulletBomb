/**
 * @file 时间轴手势状态机
 * @desc 四种意图挤在同一条轨道上：点空白 = seek、拖空白 = 搓碟、点标记 = 选中、拖标记 = 改时间。
 *   靠「按下时落在哪」+「移动了多远」区分，移动阈值前一律不产生副作用。
 *
 * ★ 提交层与瞬时层严格分开：拖动过程中只写本模块的局部 ref，**松手才写一次 store**。
 *   `store.updateAnchor` 会 `sort()` + `localStorage.setItem`，
 *   60Hz 打进去既是序列化风暴，又会在用户手里把数组换序。
 *   别把这里「优化」成实时写 store。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getEffectTemplate } from '../effects';
import { spanRangeOf } from '../span';
import type { BarrageAnchor, EffectTemplateName } from '../types';
import { pointerClientX } from './pointer-utils';
import {
  registerTemplateDropTarget,
  type TemplateDropPoint,
  type TemplateDropTarget,
} from './use-template-drag';

/** 超过该像素位移才算拖动，否则当点击 */
const DRAG_THRESHOLD = 4;

/** 两个锚点之间的最小间隔，单位：秒。防止演示时在同一处堆出四个冲击波 */
export const MIN_ANCHOR_GAP = 1;

/**
 * 搓碟时的 seek 节流间隔，单位：毫秒
 * @desc 每帧调一次 `seekVideo` 对 HLS 来说太重，10Hz 已经足够跟上手速
 */
const SCRUB_INTERVAL = 120;

/** 投放时允许指针偏离轨道的纵向容差，单位：像素 */
const DROP_BAND = 24;

export type TimelineDragMode = 'idle' | 'pending' | 'move' | 'resize' | 'scrub';

interface TrackRect {
  left: number;
  width: number;
  top: number;
  bottom: number;
}

export interface UseTimelineDragOptions {
  /** 轨道可用时长（秒），<= 0 表示时间轴不可用 */
  getDuration: () => number;
  /** 时间轴是否可用；直播下为 false */
  isAvailable: () => boolean;
  getAnchors: () => BarrageAnchor[];
  onSeek: (time: number) => void;
  onSelect: (id: string) => void;
  onCommitMove: (id: string, time: number) => void;
  /** 拖条带右端：改这个锚点播多久 */
  onCommitResize: (id: string, span: number) => void;
  onCreate: (time: number, template: EffectTemplateName) => void;
}

export const useTimelineDrag = (options: UseTimelineDragOptions) => {
  const trackRef = ref<HTMLElement>();

  const mode = ref<TimelineDragMode>('idle');
  /** 正在拖动的锚点 id */
  const activeId = ref<string>();
  /** 拖动起点的原始时间，用来画「起点刻度」—— 直接隐藏原位就看不出移动了多少 */
  const originTime = ref(0);
  /** 拖动中的落点时间 */
  const ghostTime = ref<number>();
  /** 拖动条带右端时的落点时长，单位：秒 */
  const ghostSpan = ref<number>();
  /** 指针悬停的时间气泡 */
  const hoverTime = ref<number>();
  /** 从模板库拖过来时的投放幽灵 */
  const dropPoint = ref<TemplateDropPoint>();

  let gestureRect: TrackRect | undefined;
  let pressClientX = 0;
  let lastScrubAt = 0;
  let unregisterDrop: (() => void) | undefined;
  /**
   * 按在标记上时，这次手势想改什么
   * @desc 越过拖动阈值之前分不清「点一下」和「拖一下」，所以一律先进 `pending`，
   *   够远了才按这个意图升级成 `move` 或 `resize`。
   *   按下就把模式定成 `resize` 的话，在把手上点一下不拖也会提交一次新时长
   */
  let intent: 'move' | 'resize' = 'move';

  function readRect(): TrackRect | undefined {
    const el = trackRef.value;

    if (!el) {
      return undefined;
    }

    const rect = el.getBoundingClientRect();

    return { left: rect.left, width: rect.width, top: rect.top, bottom: rect.bottom };
  }

  /** 视口横坐标 → 时间（秒），已夹在 [0, duration] 内 */
  function timeAt(clientX: number, rect: TrackRect | undefined): number {
    const duration = options.getDuration();

    if (!rect || rect.width <= 0 || duration <= 0) {
      return 0;
    }

    const ratio = (clientX - rect.left) / rect.width;

    return Math.min(Math.max(ratio, 0), 1) * duration;
  }

  /** 该时间点能否新建锚点：要在范围内，且离已有锚点至少 MIN_ANCHOR_GAP 秒 */
  function canCreateAt(time: number): boolean {
    const duration = options.getDuration();

    if (duration <= 0 || time < 0 || time > duration) {
      return false;
    }

    return options.getAnchors().every(anchor => Math.abs(anchor.time - time) >= MIN_ANCHOR_GAP);
  }

  function attach(): void {
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  }

  function detach(): void {
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  function clearGesture(): void {
    detach();

    mode.value = 'idle';
    activeId.value = undefined;
    ghostTime.value = undefined;
    ghostSpan.value = undefined;
    gestureRect = undefined;
  }

  /**
   * 条带右端落点 → 时长
   * @desc 上界取「条带区间上界」与「轨道末端」中更小的那个：
   *   越过后半段会画到轨道外面，而且把手出界之后就再也抓不到了。
   *   下界同理不能省 —— `timeAt` 会把横坐标夹在轨道内，指针拖到锚点左边时
   *   `timeAt - originTime` 是**负数**，而负的 CSS `width` 是非法值，
   *   浏览器会丢掉那条声明退回 `auto`，条带会以一个完全无关的宽度显示出来
   */
  function spanAt(clientX: number, rect: TrackRect | undefined, anchorId: string): number {
    const anchor = options.getAnchors().find(item => item.id === anchorId);

    if (!anchor) {
      return 0;
    }

    const { min, max } = spanRangeOf(anchor, getEffectTemplate(anchor.template));
    const limit = Math.min(max, options.getDuration() - originTime.value);
    const raw = timeAt(clientX, rect) - originTime.value;

    return Math.min(Math.max(raw, min), Math.max(min, limit));
  }

  /**
   * 轨道上的按下
   * @desc 标记是轨道的子节点，事件会冒泡上来，所以只在这一个入口里用 `closest` 分流，
   *   不必给每个标记单独绑事件、也不必到处 `stopPropagation`
   */
  function onTrackPointerDown(event: MouseEvent | TouchEvent): void {
    if (mode.value !== 'idle') {
      return;
    }

    const target = event.target as HTMLElement | null;
    const anchorEl = target?.closest<HTMLElement>('[data-anchor-id]');
    const anchorId = anchorEl?.dataset.anchorId;

    if (anchorId && anchorEl) {
      /**
       * ★ 先判把手再判标记 —— 顺序反了就永远进不来，因为把手也是标记的后代，
       *   `closest('[data-anchor-id]')` 两个都能命中
       */
      intent = target?.closest('[data-anchor-resize]') ? 'resize' : 'move';

      // 选中在直播下也要允许：时间轴不能 seek，但参数照样可以调
      mode.value = 'pending';
      activeId.value = anchorId;
      originTime.value = Number(anchorEl.dataset.anchorTime ?? 0);
      gestureRect = readRect();
      pressClientX = pointerClientX(event);
      options.onSelect(anchorId);
      attach();
      return;
    }

    if (!options.isAvailable()) {
      return;
    }

    gestureRect = readRect();
    pressClientX = pointerClientX(event);
    mode.value = 'scrub';
    lastScrubAt = Date.now();
    options.onSeek(timeAt(pressClientX, gestureRect));
    attach();
  }

  function onPointerMove(event: MouseEvent | TouchEvent): void {
    const clientX = pointerClientX(event);
    const rect = gestureRect ?? readRect();

    if (mode.value === 'pending') {
      if (Math.abs(clientX - pressClientX) < DRAG_THRESHOLD) {
        return;
      }

      mode.value = intent;
    }

    if (mode.value === 'resize') {
      if (activeId.value !== undefined) {
        ghostSpan.value = spanAt(clientX, rect, activeId.value);
      }

      return;
    }

    if (mode.value === 'move') {
      ghostTime.value = timeAt(clientX, rect);
      return;
    }

    if (mode.value === 'scrub') {
      const now = Date.now();

      if (now - lastScrubAt < SCRUB_INTERVAL) {
        return;
      }

      lastScrubAt = now;
      options.onSeek(timeAt(clientX, rect));
    }
  }

  function onPointerUp(event: MouseEvent | TouchEvent): void {
    const finishedMode = mode.value;
    const anchorId = activeId.value;
    const ghost = ghostTime.value;
    const span = ghostSpan.value;
    const rect = gestureRect ?? readRect();
    const clientX = pointerClientX(event);

    clearGesture();

    if (finishedMode === 'move' && anchorId !== undefined && ghost !== undefined) {
      // 时钟本来就 2Hz，拖动时保持连续、提交时才取整
      options.onCommitMove(anchorId, Math.round(ghost));
      return;
    }

    // 没越过阈值就是「点了一下把手」，不提交 —— 这正是 pending 那一段存在的理由
    if (finishedMode === 'resize' && anchorId !== undefined && span !== undefined) {
      options.onCommitResize(anchorId, span);
      return;
    }

    if (finishedMode === 'scrub') {
      // 节流可能吞掉了最后一次移动，这里补一发，否则松手位置与播放头对不上
      options.onSeek(timeAt(clientX, rect));
    }
  }

  /** 悬停气泡只在没有手势时跟着走 */
  function onTrackPointerMove(event: MouseEvent | TouchEvent): void {
    if (mode.value !== 'idle' || !options.isAvailable()) {
      return;
    }

    hoverTime.value = timeAt(pointerClientX(event), readRect());
  }

  function onTrackPointerLeave(): void {
    hoverTime.value = undefined;
  }

  onMounted(() => {
    const dropTarget: TemplateDropTarget = {
      resolve: (clientX, clientY) => {
        const rect = readRect();

        if (!rect || clientY < rect.top - DROP_BAND || clientY > rect.bottom + DROP_BAND) {
          return null;
        }

        const time = Math.round(timeAt(clientX, rect));

        return { time, valid: canCreateAt(time) };
      },
      onHover: point => {
        dropPoint.value = point ?? undefined;
      },
      onDrop: (point, template) => {
        options.onCreate(Math.round(point.time), template);
      },
    };

    unregisterDrop = registerTemplateDropTarget(dropTarget);
  });

  onBeforeUnmount(() => {
    clearGesture();
    unregisterDrop?.();
  });

  return {
    trackRef,
    mode,
    activeId,
    originTime,
    ghostTime,
    ghostSpan,
    hoverTime,
    dropPoint,

    timeAt,
    canCreateAt,

    onTrackPointerDown,
    onTrackPointerMove,
    onTrackPointerLeave,
  };
};
