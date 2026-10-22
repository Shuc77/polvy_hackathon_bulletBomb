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
import { isSlotFree, nearestFreeTime } from '../anchor-utils';
import { collectLeadSecOf } from '../collect';
import { getEffectTemplate } from '../effects';
import { spanOf, spanRangeOf } from '../span';
import type { BarrageAnchor, EffectTemplateName } from '../types';
import { pointerClientX } from './pointer-utils';
import {
  registerTemplateDropTarget,
  type TemplateDropPoint,
  type TemplateDropTarget,
} from './use-template-drag';

/** 超过该像素位移才算拖动，否则当点击 */
const DRAG_THRESHOLD = 4;

/**
 * 搓碟时的 seek 节流间隔，单位：毫秒
 * @desc 每帧调一次 `seekVideo` 对 HLS 来说太重，10Hz 已经足够跟上手速
 */
const SCRUB_INTERVAL = 120;

/** 投放时允许指针偏离轨道的纵向容差，单位：像素 */
const DROP_BAND = 24;

/**
 * 自动对齐的吸附半径，单位：像素
 * @desc 用像素而不是固定秒数：同一条时间轴在 1 分钟和 1 小时的回放里，
 *   1 秒对应的像素差了一个数量级。8px 在 6 分钟的片子上是 2.4 秒，
 *   在 1 小时的片子上就是 24 秒 —— 作者始终是在「瞄着 8 像素内的线」对齐
 */
const SNAP_PX = 8;

/**
 * 吸附半径折算成秒后的下限
 * @desc 短视频上 8px 可能只有 0.2 秒，太难点中；给一个手能停住的最小窗口
 */
const SNAP_MIN_SEC = 0.4;

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
  /** 播放头当前时间，用作自动对齐的目标之一 */
  getPlayhead: () => number;
  onSeek: (time: number) => void;
  onSelect: (id: string) => void;
  /**
   * 提交移动
   * @param aligned 本次落点命中了自动对齐。为真时 store 不再做 1 秒间隔的推挤 ——
   *   作者明确要对齐到另一条特效/播放头上，推开 1 秒恰好就是他要消除的偏差
   */
  onCommitMove: (id: string, time: number, aligned?: boolean) => void;
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
  /**
   * 当前吸附到的对齐时间
   * @desc 与 `ghostTime` 分开：幽灵是最终落点（可能已经被 1 秒间隔推到空位），
   *   这个只记「命中了哪条对齐线」，用来画参考线和提示
   */
  const snapTime = ref<number>();
  /** 拖动条带右端时的落点时长，单位：秒 */
  const ghostSpan = ref<number>();
  /** 指针悬停的时间气泡 */
  const hoverTime = ref<number>();
  /** 从模板库拖过来时的投放幽灵 */
  const dropPoint = ref<TemplateDropPoint>();

  let gestureRect: TrackRect | undefined;
  let pressClientX = 0;
  /**
   * 按下点与锚点触发时刻的秒数差
   * @desc ★ 圆点有十几像素宽，按在它的左/右半边时，指针位置与触发时刻
   *   差着零点几秒（长视频上就是好几秒）。直接把指针位置当成新触发时刻的话，
   *   越过拖动阈值的第一帧锚点会「跳」一下，看起来像是抓错了特效。
   *   记下偏移后全程按「抓哪儿拖哪儿」走
   */
  let grabOffsetSec = 0;
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

  /**
   * 该时间点能否新建锚点：要在范围内，且不挤到已有锚点
   * @desc 间距那半条判据走 `anchor-utils` 的 `isSlotFree` —— store 的 `moveAnchor`
   *   用的是同一个函数。「放不下但拖得动」就是两边各写一份判据的后果
   */
  function canCreateAt(time: number): boolean {
    const duration = options.getDuration();

    if (duration <= 0 || time < 0 || time > duration) {
      return false;
    }

    return isSlotFree(options.getAnchors(), time);
  }

  /**
   * 吸附半径换算成秒：8px 在不同总时长的轨道上不是同一个秒数
   * @desc ★ 不设上限。长视频里 1 秒远小于 1px，若把半径压到 1 秒以下，
   *   磁铁会比一个像素还窄，永远吸不中。半径大于 1 秒时，「离锚点 1 秒」
   *   的空位确实会被吸走 —— 但在那个比例尺上它本来就不足一个像素，
   *   作者也分不出这个区别
   */
  function snapThreshold(rect: TrackRect | undefined): number {
    const duration = options.getDuration();

    if (!rect || rect.width <= 0 || duration <= 0) {
      return SNAP_MIN_SEC;
    }

    return Math.max(SNAP_MIN_SEC, (SNAP_PX / rect.width) * duration);
  }

  /**
   * 找最近的对齐目标
   * @desc 候选全是**看得见的边**：播放头、别的特效的触发点、收集段起点、条带终点、0s。
   *   在阈值内取最近的一条。返回 undefined 表示这次拖动不吸附，走普通的空位逻辑
   */
  function snapTargetOf(
    time: number,
    rect: TrackRect | undefined,
    anchorId: string | undefined,
  ): number | undefined {
    const duration = options.getDuration();

    if (duration <= 0) {
      return undefined;
    }

    const candidates: number[] = [0, Math.round(options.getPlayhead())];

    options.getAnchors().forEach(anchor => {
      if (anchor.id === anchorId) {
        return;
      }

      const descriptor = getEffectTemplate(anchor.template);
      const lead = collectLeadSecOf(anchor, descriptor);
      const span = spanOf(anchor, descriptor);

      candidates.push(Math.round(anchor.time));

      if (lead > 0) {
        candidates.push(Math.round(Math.max(0, anchor.time - lead)));
      }

      candidates.push(Math.round(anchor.time + span));
    });

    const threshold = snapThreshold(rect);
    let best: number | undefined;
    let bestDistance = Infinity;

    candidates.forEach(candidate => {
      if (candidate < 0 || candidate > duration) {
        return;
      }

      const distance = Math.abs(candidate - time);

      if (distance <= threshold && distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });

    return best;
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
    snapTime.value = undefined;
    gestureRect = undefined;
    grabOffsetSec = 0;
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
      grabOffsetSec = timeAt(pressClientX, gestureRect) - originTime.value;
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
      // 改时长不参与时间对齐：条带右端对齐另一条边是另一套手势，别混进来
      snapTime.value = undefined;

      if (activeId.value !== undefined) {
        ghostSpan.value = spanAt(clientX, rect, activeId.value);
      }

      return;
    }

    if (mode.value === 'move') {
      /**
       * 触发时刻 = 指针时刻 - 抓取偏移，保证按下时条带不会瞬移
       * @desc 再夹回 [0, duration]：在圆点边缘按下时偏移最多半个圆点，
       *   指针顶到轨道左端后触发时刻会是负数 —— 不夹的话 0s 这个候选
       *   永远差着那半个圆点，作者拖到最左边也吸不到 0
       */
      const duration = options.getDuration();
      const raw = Math.min(duration, Math.max(0, timeAt(clientX, rect) - grabOffsetSec));
      const snapped = snapTargetOf(raw, rect, activeId.value);

      snapTime.value = snapped;

      /**
       * ★ 幽灵位置也要走提交时的吸附
       * @desc 只把手指位置画出来的话，0s 这类被别的锚点占住（最小间隔 1 秒）的
       *   落点会一路显示 0，松手那一瞬才被 `moveAnchor` 吸到最近空位 ——
       *   作者看到的是「拖到 0，松手又弹回 5s」。
       *
       *   命中了自动对齐就画对齐点；没有命中才让 1 秒间隔把落点推开。
       *   两种情况下幽灵与最终落盘都是同一个数，没有「回弹」这一步
       */
      ghostTime.value =
        snapped !== undefined
          ? snapped
          : nearestFreeTime(options.getAnchors(), raw, activeId.value);
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
    const aligned = snapTime.value !== undefined;
    const rect = gestureRect ?? readRect();
    const clientX = pointerClientX(event);

    clearGesture();

    if (finishedMode === 'move' && anchorId !== undefined && ghost !== undefined) {
      // 时钟本来就 2Hz，拖动时保持连续、提交时才取整
      options.onCommitMove(anchorId, Math.round(ghost), aligned);
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

        /**
         * 投放也吃自动对齐
         * @desc 拖到已有特效/播放头旁边时直接吸过去新建，不再报「此处不可放置」。
         *   否则同一个「想叠在一起」的意图，拖动锚点能对齐，拖模板进来却被拒绝
         */
        const raw = timeAt(clientX, rect);
        const snapped = snapTargetOf(raw, rect, undefined);
        const time = snapped !== undefined ? snapped : Math.round(raw);

        return { time, valid: snapped !== undefined || canCreateAt(time) };
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
    snapTime,
    hoverTime,
    dropPoint,

    timeAt,
    canCreateAt,

    onTrackPointerDown,
    onTrackPointerMove,
    onTrackPointerLeave,
  };
};
