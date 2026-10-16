/**
 * @file 时长归属
 * @desc 时间轴上那条可拖拽的条带表示「这个特效占多久」。但**「占多久」落到哪个字段，
 *   取决于这个锚点怎么跑** —— 三种情况，各存各的字段：
 *
 *   | 情况 | 条带长度 | 写进 | 生效方式 |
 *   |---|---|---|---|
 *   | `countdown` | 倒计时时长 | `params.countdownSec` | 长度就是内容 |
 *   | 互动模式 | 收集窗时长 | `feed.windowSec` | 已有字段 |
 *   | 其余（static） | 播放时长 | `anchor.spanSec` | 驱动器整体时间缩放 |
 *
 *   ★ **这层映射只在这个文件里存在**。条带宽度、拖拽落点、拖动起点、上下界钳制、
 *   驱动器的时间缩放系数 —— 五处调用全都走这里，谁都不许直接读 `anchor.spanSec`。
 *   理由和 `anchor-utils` 那条一样：一个字段多个写入方，静默分叉只是时间问题。
 *
 *   为什么必须特判而不能统一用一个字段：`params.countdownSec` 已经是倒计时的内容
 *   （`applyParams` 直接吃它），`feed.windowSec` 已经是收集窗的长度（`normalizeFeed`
 *   按 `[3, 30]` 钳它）。硬塞第三个数只会制造「两个数都说自己算数」的状态。
 */
import { COUNTDOWN_DEFAULTS, COUNTDOWN_MAX_SEC, COUNTDOWN_MIN_SEC } from './effects/countdown';
import { DEFAULT_WINDOW_SEC, MAX_WINDOW_SEC, MIN_WINDOW_SEC, resolveFeedMode } from './feed-window';
import type { BarrageAnchor, EffectTemplateDescriptor } from './types';

/** 描述符查不到 `naturalSec` 时的兜底，单位：秒 */
const DEFAULT_NATURAL_SEC = 3;

/**
 * 时间缩放的上下界
 * @desc 下界刻意不是 0.25：驱动器循环预览时的 `LOOP_GAP` 是 **0.5 秒挂钟时间、
 *   不参与缩放**，缩得比它短就成了「0.4 秒特效 + 0.5 秒空白」的频闪。
 *   卡在 0.5 就够不着那个区间。上界 4 是因为拉得太长时后半段基本是空屏
 *   （比如彩带的横向速度不封顶，10 倍速下彩带早飘出画布了）
 */
export const SCALE_MIN = 0.5;
export const SCALE_MAX = 4;

/** 纯缩放（非倒计时、非互动）的最短时长，单位：秒 */
const MIN_STRETCH_SEC = 0.5;

/** 量化到整秒 / 十分之一秒，用乘法而不是除法，避免浮点尾数 */
const QUANTUM_WHOLE = 1;
const QUANTUM_TENTH = 10;

export interface SpanRange {
  min: number;
  max: number;
}

/** 三种去向 */
type SpanCase = 'countdown' | 'window' | 'stretch';

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 这个锚点的时长按哪种情况处理
 * @desc ★ 判断「是否互动」必须走 `resolveFeedMode`，它内含两层兜底
 *   （没写 `feed` → 模板第一项；写了不支持的 → 退回模板第一项）。
 *   自己写 `anchor.feed?.mode !== 'static'` 会在配置里带着一个不支持的 mode 时给出不同答案
 */
function spanCaseOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): SpanCase {
  if (anchor.template === 'countdown') {
    return 'countdown';
  }

  return resolveFeedMode(anchor, descriptor) === 'static' ? 'stretch' : 'window';
}

/** 条带的量化精度：整秒还是十分之一秒 */
function quantumOf(spanCase: SpanCase): number {
  return spanCase === 'stretch' ? QUANTUM_TENTH : QUANTUM_WHOLE;
}

/**
 * 条带的可达区间
 * @desc 返回上下界而不是只有一个下界 —— 倒计时的上限（3599 秒）必须在**拖拽那一刻**
 *   就生效。只钳下界的话作者能把条带拖到 5000 秒、条带也照着画，而 `applyParams`
 *   会把 `countdownSec` 钳回 3599，条带和实际时长当场对不上
 *
 *   边界值一律引用模板与收集窗自己那对常量，不在这里另写一份
 */
export function spanRangeOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): SpanRange {
  switch (spanCaseOf(anchor, descriptor)) {
    case 'countdown':
      return { min: COUNTDOWN_MIN_SEC, max: COUNTDOWN_MAX_SEC };
    case 'window':
      return { min: MIN_WINDOW_SEC, max: MAX_WINDOW_SEC };
    default:
      return { min: MIN_STRETCH_SEC, max: Number.POSITIVE_INFINITY };
  }
}

/**
 * 缺省时长：作者没拖过条带时，这条带子该有多长
 * @desc 三种情况各自的「本来多长」，都从既有配置里读，不引入新概念
 */
export function naturalSpanOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): number {
  switch (spanCaseOf(anchor, descriptor)) {
    case 'countdown': {
      const seconds = anchor.params?.countdownSec;

      return isPositiveFinite(seconds)
        ? seconds
        : COUNTDOWN_DEFAULTS.countdownSec ?? DEFAULT_NATURAL_SEC;
    }

    case 'window': {
      const seconds = anchor.feed?.windowSec;

      return isPositiveFinite(seconds) ? seconds : DEFAULT_WINDOW_SEC;
    }

    default: {
      const seconds = descriptor?.naturalSec;

      return isPositiveFinite(seconds) ? seconds : DEFAULT_NATURAL_SEC;
    }
  }
}

/**
 * 当前时长：条带该画多长
 * @desc ★ `anchor.spanSec` **只在纯缩放那一路上算数**。倒计时与互动各自有自己的字段，
 *   一个行将来历不明的 `spanSec`（比如换过模板留下的）绝不能在这里赢
 */
export function spanOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): number {
  if (spanCaseOf(anchor, descriptor) === 'stretch' && isPositiveFinite(anchor.spanSec)) {
    return anchor.spanSec;
  }

  return naturalSpanOf(anchor, descriptor);
}

/** 把外部给的秒数收敛到合法区间 + 量化 */
function normalizeSpan(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
  seconds: number,
  spanCase: SpanCase,
): number {
  const { min, max } = spanRangeOf(anchor, descriptor);
  const value = isPositiveFinite(seconds) ? seconds : min;
  const quantum = quantumOf(spanCase);

  return Math.round(clamp(value, min, max) * quantum) / quantum;
}

/**
 * 拖拽落点 / 面板输入 → 该写哪个字段的补丁
 *
 * @desc ★ 两路返回的是**嵌套补丁**，而 `store.updateAnchor` 是 `Object.assign`
 *   —— **整体替换，不做深合并**。所以同级字段必须一起摊开：
 *   漏 `...anchor.params` 会把作者调好的配色抹掉；
 *   漏 `mode` 会让 `normalizeFeed` 下次读到没有 `mode` 的 `feed` 而**整块丢弃**，
 *   锚点静默退回 `static`
 *
 *   发射补丁对象而不是裸秒数：否则调用方要再造一遍上面那三种情况的判断，
 *   等于把这层知识复制到第二个地方
 */
export function spanPatchOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
  seconds: number,
): Partial<BarrageAnchor> {
  const spanCase = spanCaseOf(anchor, descriptor);
  const value = normalizeSpan(anchor, descriptor, seconds, spanCase);

  switch (spanCase) {
    case 'countdown':
      return { params: { ...anchor.params, countdownSec: value } };

    case 'window':
      return {
        feed: { ...anchor.feed, mode: resolveFeedMode(anchor, descriptor), windowSec: value },
      };

    default:
      return { spanSec: value };
  }
}

/**
 * 驱动器的时间缩放系数：实例时钟该跑多快
 *
 * @desc 返回 `1` 是「正常速度」。大于 1 是慢放（`update` 收到的是 `delta / scale`），
 *   小于 1 是快放。
 *
 *   ★ 每一层都必须挡住非有限值。`clamp` **挡不住 `NaN`**（`Math.max(NaN, 0.5)` 就是 `NaN`），
 *   而 `NaN >= DURATION` **永远为 false** —— 一个 NaN 系数会让轨道永不结束，
 *   驱动器于是每帧都返回「还要继续」，共享 rAF 被永久钉住，无声烧帧到页面关闭
 *
 *   互动轨道恒不缩放：它内部的缓动（`easeToward`）吃的是挂钟 delta，
 *   再叠一层缩放就是同一根轨道上跑两个时钟
 */
export function resolveTimeScale(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): number {
  if (spanCaseOf(anchor, descriptor) !== 'stretch') {
    return 1;
  }

  const natural = descriptor?.naturalSec;

  if (!isPositiveFinite(natural)) {
    return 1;
  }

  const span = spanOf(anchor, descriptor);

  if (!isPositiveFinite(span)) {
    return 1;
  }

  const scale = span / natural;

  if (!Number.isFinite(scale)) {
    return 1;
  }

  return clamp(scale, SCALE_MIN, SCALE_MAX);
}
