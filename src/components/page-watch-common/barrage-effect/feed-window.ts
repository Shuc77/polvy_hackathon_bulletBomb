/**
 * @file 收集窗
 * @desc 锚点命中后开一个时间窗，窗内持续把弹幕换算成特效参数。
 *   这里**只管数据**，不碰渲染 —— 实例的生死归特效层。
 *
 *   为什么不是「拉长一次动画」：六个模板的 `DURATION` 全是模块常量，
 *   没有一个支持变时长，而窗（默认 6 秒）比任何单次动画（1.5 ~ 2.8 秒）都长。
 */
import type { BarrageSample } from './barrage-signal';
import type { AnchorFeed, BarrageAnchor, EffectFeedMode, EffectTemplateDescriptor } from './types';

/** 缺省窗长，单位：秒 */
export const DEFAULT_WINDOW_SEC = 6;

export const MIN_WINDOW_SEC = 3;
export const MAX_WINDOW_SEC = 30;

/** 关键词的分隔符：中英文逗号、顿号、空白都认 */
const KEYWORD_SPLIT = /[,，、\s]+/;

/** 一轮读数 */
export interface FeedReading {
  /** 窗内弹幕总条数（真实条数，不受采样上限影响） */
  count: number;
  /** A 派命中数 */
  primary: number;
  /** B 派命中数 */
  secondary: number;
  /** A 派占比，0 ~ 1。已做平滑 */
  share: number;
  /** 条/秒 */
  rate: number;
  /** 窗内原文采样，供文字通道取字 */
  texts: string[];
  /** A 派命中原文，供「按阵营分边」的模板取用（红蓝对抗） */
  primaryTexts: string[];
  /** B 派命中原文 */
  secondaryTexts: string[];
}

export interface FeedWindowOptions {
  mode: EffectFeedMode;
  windowSec?: number;
  wordsA?: string;
  wordsB?: string;
  /** `performance.now()` */
  now: number;
}

export interface FeedWindow {
  readonly mode: EffectFeedMode;
  /** 实际生效的窗长（已收敛到合法区间） */
  readonly windowSec: number;
  readonly openedAt: number;
  readonly closesAt: number;
  /** 是否已到关窗时刻 */
  isClosing(now: number): boolean;
  /** 距关窗还剩多少秒 */
  remaining(now: number): number;
  read(sample: BarrageSample): FeedReading;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 拆关键词。中文没有大小写，但 A/B/a/b 这类拉丁字符要认 */
export function parseKeywords(raw?: string): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(KEYWORD_SPLIT)
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

type Side = 'primary' | 'secondary' | undefined;

function classify(text: string, wordsA: string[], wordsB: string[]): Side {
  const lower = text.toLowerCase();
  const hitA = wordsA.some(word => lower.includes(word));
  const hitB = wordsB.some(word => lower.includes(word));

  // 两边都命中算弃权：与其猜，不如不记。「都没命中」也走这条路
  if (hitA === hitB) {
    return undefined;
  }

  return hitA ? 'primary' : 'secondary';
}

export function createFeedWindow(options: FeedWindowOptions): FeedWindow {
  const wordsA = parseKeywords(options.wordsA);
  const wordsB = parseKeywords(options.wordsB);
  const windowSec = clamp(options.windowSec ?? DEFAULT_WINDOW_SEC, MIN_WINDOW_SEC, MAX_WINDOW_SEC);
  const openedAt = options.now;
  const closesAt = openedAt + windowSec * 1000;

  function read(sample: BarrageSample): FeedReading {
    let primary = 0;
    let secondary = 0;
    const primaryTexts: string[] = [];
    const secondaryTexts: string[] = [];

    // 只统计采样里的原文（最多 32 条）。对冲本来就是个比例，
    // 对最近 32 条抽样与对全窗统计没有可感知的差别，而全窗统计要留着所有原文
    sample.texts.forEach(text => {
      const side = classify(text, wordsA, wordsB);

      if (side === 'primary') {
        primary += 1;
        primaryTexts.push(text);
      } else if (side === 'secondary') {
        secondary += 1;
        secondaryTexts.push(text);
      }
    });

    const votes = primary + secondary;

    return {
      count: sample.count,
      primary,
      secondary,
      // 拉普拉斯平滑：0 票时正好 0.5（中性），第一条弹幕不会把缝瞬间甩到边上。
      // 裸占比在这里是 1/0 → 直接把分割线顶到最左
      share: (primary + 1) / (votes + 2),
      rate: sample.rate,
      texts: sample.texts,
      primaryTexts,
      secondaryTexts,
    };
  }

  return {
    mode: options.mode,
    windowSec,
    openedAt,
    closesAt,
    isClosing: (now: number) => now >= closesAt,
    remaining: (now: number) => Math.max(0, (closesAt - now) / 1000),
    read,
  };
}

/**
 * 定出这个锚点实际按哪种方式跑
 *
 * @desc 两条兜底都很关键：
 *   1. 锚点没写 `feed` → 落到模板 `feedModes` 的第一项。**所有模板的第一项都是
 *      `static`**，所以旧存档与旧分享链接的行为一点不变。
 *   2. 锚点写了模板不支持的驱动方式（手改过的脏配置、或模板能力变了）
 *      → 退回默认项，别让一条脏配置把画面搞坏
 */
export function resolveFeedMode(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): EffectFeedMode {
  const fallback = descriptor?.feedModes[0] ?? 'static';
  const declared = anchor.feed?.mode;

  if (!declared) {
    return fallback;
  }

  return descriptor?.feedModes.includes(declared) ? declared : fallback;
}

/** 从锚点取窗口配置，字段散落在 `feed` 上 */
export function feedOptionsOf(anchor: BarrageAnchor, mode: EffectFeedMode): FeedWindowOptions {
  const feed: AnchorFeed = anchor.feed ?? { mode };

  return {
    mode,
    windowSec: feed.windowSec,
    wordsA: feed.wordsA,
    wordsB: feed.wordsB,
    now: performance.now(),
  };
}
