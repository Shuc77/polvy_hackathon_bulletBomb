/**
 * @file 主动答题
 * @desc 锚点前提前弹答题卡、提前收集弹幕。这个文件是「要不要收集 / 收多久 /
 *   题目是什么」的**唯一判据** —— 时间轴、调度器、驱动器、工作台舞台都读它。
 *
 *   ★ 两个函数都先过 `resolveFeedMode`。锚点上可能还留着 `collect`，但驱动方式
 *   已经被切成 `static`（或者换了不支持互动的模板）—— 那种情况下不该再收集，
 *   否则时间轴会画出一条虚线收集带，而驱动器根本没开收集窗。
 *
 *   这里是纯函数，不碰 Vue、不碰播放器，方便四处复用。
 */
import { DEFAULT_WINDOW_SEC, MAX_WINDOW_SEC, MIN_WINDOW_SEC, resolveFeedMode } from './feed-window';
import type { BarrageAnchor, EffectTemplateDescriptor } from './types';

/** 答题卡上要显示的内容 */
export interface CollectPrompt {
  question: string;
  /** 对冲模式下 A/B 两派的关键词，没有配置就不显示胶囊 */
  hintA?: string;
  hintB?: string;
}

/** 关键词分隔符：与 `feed-window.ts` 的 `parseKeywords` 同一套 */
const KEYWORD_SPLIT = /[,，、\s]+/;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 取第一个关键词用于展示。不转小写 —— 这是给观众看的原文 */
function firstKeyword(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  return raw
    .split(KEYWORD_SPLIT)
    .map(item => item.trim())
    .find(Boolean);
}

/**
 * 这个锚点提前多少秒开始收集
 *
 * @returns 0 表示不预滚（没开答题卡，或驱动方式不是互动）
 *
 * @desc 缺省沿用 `feed.windowSec`：作者只调一个「互动窗口」时，收集期和特效期
 *   一样长是最好理解的默认。上下界与收集窗共用同一对常量，时间轴上的虚线带
 *   不会越拖越长
 */
export function collectLeadSecOf(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): number {
  if (!anchor.feed?.collect) {
    return 0;
  }

  if (resolveFeedMode(anchor, descriptor) === 'static') {
    return 0;
  }

  const requested = Number(anchor.feed.collect.leadSec ?? anchor.feed.windowSec);
  const seconds = Number.isFinite(requested) ? requested : DEFAULT_WINDOW_SEC;

  return Math.round(clamp(seconds, MIN_WINDOW_SEC, MAX_WINDOW_SEC));
}

/**
 * 答题卡文案
 *
 * @returns `undefined` 表示这个锚点此刻不该弹答题卡
 *
 * @desc 作者填了 `prompt` 就用它；没填才按驱动方式生成一句。自动文案刻意写得
 *   **可执行**（告诉观众发什么），而不是「请参与互动」这种没有信息量的提示
 */
export function resolveCollectPrompt(
  anchor: BarrageAnchor,
  descriptor: EffectTemplateDescriptor | undefined,
): CollectPrompt | undefined {
  if (!anchor.feed?.collect) {
    return undefined;
  }

  const mode = resolveFeedMode(anchor, descriptor);

  if (mode === 'static') {
    return undefined;
  }

  const hintA = mode === 'polarity' ? firstKeyword(anchor.feed.wordsA) : undefined;
  const hintB = mode === 'polarity' ? firstKeyword(anchor.feed.wordsB) : undefined;

  const custom = anchor.feed.collect.prompt?.trim();
  if (custom) {
    return { question: custom, hintA, hintB };
  }

  let question: string;

  if (mode === 'polarity') {
    if (hintA && hintB) {
      question = `支持哪一边？发送「${hintA}」或「${hintB}」`;
    } else if (hintA || hintB) {
      question = `支持哪一边？发送「${hintA ?? hintB}」`;
    } else {
      question = '支持哪一边？发送你的观点';
    }
  } else if (mode === 'text') {
    question = '发弹幕参与，你的话会出现在画面里';
  } else if (anchor.template === 'converge') {
    const answerText =
      anchor.params?.answerText?.trim() || descriptor?.defaults.answerText?.trim() || '';

    question = answerText ? '答案会是什么？发送你的答案' : '发弹幕参与，弹幕会被吸进中心';
  } else {
    question = '发弹幕参与，弹幕越多特效越猛';
  }

  return { question, hintA, hintB };
}
