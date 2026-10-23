/**
 * @file 字幕术语 → 直播小伙伴
 * @desc 把字幕模块已经匹配出来的术语和上下文，按「一句字幕」为单位推给小助手。
 *
 *   两条不能想当然的地方：
 *
 *   1. **必须按字幕条目去重** —— 直播字幕每 500ms 会重复应用同一条，
 *      回放的 TimeUpdate 也会反复计算同一句。直接上报会把出现次数刷成几十次，
 *      宠物还会不停弹「已同步到词库」。
 *
 *   2. **场次 ID 不由这里拼** —— `window.LiveBuddy` 由宿主页创建，它才知道
 *      当前页面用的是 targetSessionId 还是 playback-<channel>-<vid>。
 *      这里只送术语本身，宿主补 sessionId。
 */
import { TERM_MAP } from '@/assets/term-dictionaries';
import type { TermSegment } from '@/core/term/term-matcher';

/** 最多记住多少句字幕；超出后淘汰最早的，避免长直播无限占内存 */
const MAX_TRACKED_CUES = 500;
const MAX_CONTEXT_LENGTH = 400;
const MAX_EXPLANATION_LENGTH = 240;

const cueTerms = new Map<string, Set<string>>();
const cueContexts = new Map<string, string>();

export interface SubtitleTermCue {
  /** 同一句字幕的稳定标识，例如 `live:123` 或 `replay:<原文>` */
  cueKey: string;
  segments: TermSegment[];
  sourceText: string;
  translationText?: string;
  timestamp?: number;
}

function rememberCue<T>(map: Map<string, T>, key: string, value: T): void {
  if (map.size >= MAX_TRACKED_CUES && !map.has(key)) {
    const oldestKey = map.keys().next().value;
    if (oldestKey !== undefined) map.delete(oldestKey);
  }
  map.set(key, value);
}

function buildExplanation(termId: string): string | undefined {
  const term = TERM_MAP.get(termId);
  if (!term) return undefined;
  const parts = [term.zh, term.note].filter(Boolean);
  if (!parts.length) return undefined;
  return parts.join('；').slice(0, MAX_EXPLANATION_LENGTH);
}

/**
 * 上报一句字幕
 * @desc 术语按「当前这句里出现的次数」累加；上下文同一句只更新一次，
 *   翻译后到时再补一条，这样 AI 拿到的上下文不会缺中文。
 */
export function publishSubtitleTermCue(cue: SubtitleTermCue): void {
  if (typeof window === 'undefined') return;
  const buddy = window.LiveBuddy;
  if (!buddy) return;

  const counts = new Map<string, number>();
  cue.segments.forEach(segment => {
    if (!segment.termId) return;
    counts.set(segment.termId, (counts.get(segment.termId) || 0) + 1);
  });

  if (counts.size) {
    let seen = cueTerms.get(cue.cueKey);
    if (!seen) {
      seen = new Set<string>();
      rememberCue(cueTerms, cue.cueKey, seen);
    }

    counts.forEach((occurrences, termId) => {
      if (seen!.has(termId)) return;
      seen!.add(termId);

      const term = TERM_MAP.get(termId);
      if (!term) return;

      buddy.injectTerm({
        term: term.canonical,
        translation: term.en || term.zh,
        explanation: buildExplanation(termId),
        timestamp: cue.timestamp,
        source: 'subtitle',
        occurrences,
      });
    });
  }

  const contextText = [cue.sourceText, cue.translationText]
    .filter(Boolean)
    .join('\n')
    .slice(0, MAX_CONTEXT_LENGTH);
  if (!contextText) return;
  if (cueContexts.get(cue.cueKey) === contextText) return;

  rememberCue(cueContexts, cue.cueKey, contextText);
  buddy.setLiveContext({
    text: contextText,
    timestamp: cue.timestamp,
  });
}
