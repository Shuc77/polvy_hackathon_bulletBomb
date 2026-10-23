/**
 * @file 专业术语匹配工具
 */

export type TermTrack = 'trade' | 'medical' | 'workplace';

export interface TermItem {
  id: string;
  track: TermTrack;
  canonical: string;
  aliases?: string[];
  zh: string;
  en: string;
  note?: string;
  /** 子领域，例如“影像学”“心血管内科” */
  category?: string;
  /** 数字越小优先级越高，用于多义缩写默认选中 */
  priority?: number;
}

export interface TermMatch {
  start: number;
  end: number;
  /** 默认选中的术语 */
  termId: string;
  /** 同一匹配文本对应的所有候选术语 */
  termIds: string[];
}

export interface TermSegment {
  text: string;
  termId?: string;
  termIds?: string[];
}

export interface TermTrieNode {
  children: Map<string, TermTrieNode>;
  termIds?: string[];
}

export interface TermTrie {
  root: TermTrieNode;
  /** 自然语言术语的大小写不敏感 Trie */
  ciRoot: TermTrieNode;
  termMap: Map<string, TermItem>;
  canonicalKeys: Map<string, string>;
}

interface NormalizedText {
  text: string;
  starts: number[];
  ends: number[];
}

const WORD_CHAR = /[A-Za-z0-9_]/;
const MAX_TERM_MATCHES = 8;

/**
 * Keep letter abbreviations case-sensitive; allow natural-language English terms
 * to match captions with different casing.
 */
function shouldBuildCaseInsensitiveKey(key: string): boolean {
  return /\s/.test(key) || /[a-z]{2,}/.test(key);
}

/**
 * 归一化文本并保留字符到原文的索引映射
 */
function normalizeWithMap(input: string): NormalizedText {
  let text = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;

  for (const char of input) {
    // 保留大小写：英文缩写和术语严格区分大小写
    const normalized = char.normalize('NFKC');

    for (let i = 0; i < normalized.length; i++) {
      text += normalized[i];
      starts.push(offset);
      ends.push(offset + char.length);
    }

    offset += char.length;
  }

  return { text, starts, ends };
}

/**
 * 构建术语 Trie，同名别名会保留全部候选而不是互相覆盖
 */
export function buildTrie(terms: TermItem[]): TermTrie {
  const root: TermTrieNode = { children: new Map() };
  const ciRoot: TermTrieNode = { children: new Map() };
  const termMap = new Map<string, TermItem>();
  const canonicalKeys = new Map<string, string>();

  terms.forEach(term => {
    termMap.set(term.id, term);
    canonicalKeys.set(term.id, normalizeWithMap(term.canonical).text);

    const keys = [term.canonical, ...(term.aliases ?? [])];

    keys.forEach(key => {
      const normalized = normalizeWithMap(key).text;
      if (!normalized) return;

      insertTrieKey(root, normalized, term.id);

      // 缩写（CT、PD-1、FOB）保持严格大小写；普通英文术语允许句首/句中大小写变化。
      if (shouldBuildCaseInsensitiveKey(normalized)) {
        insertTrieKey(ciRoot, normalized.toLowerCase(), term.id);
      }
    });
  });

  return { root, ciRoot, termMap, canonicalKeys };
}

function insertTrieKey(root: TermTrieNode, key: string, termId: string) {
  let node = root;

  for (const char of key) {
    let child = node.children.get(char);
    if (!child) {
      child = { children: new Map() };
      node.children.set(char, child);
    }
    node = child;
  }

  if (!node.termIds) node.termIds = [];
  if (!node.termIds.includes(termId)) node.termIds.push(termId);
}

/**
 * 英文术语检查词边界，避免 AI 命中 said
 */
function hasValidBoundary(text: string, start: number, end: number): boolean {
  const startsWithWord = WORD_CHAR.test(text[start]);
  const endsWithWord = WORD_CHAR.test(text[end - 1]);

  if (startsWithWord && start > 0 && WORD_CHAR.test(text[start - 1])) {
    return false;
  }

  if (endsWithWord && end < text.length && WORD_CHAR.test(text[end])) {
    return false;
  }

  return true;
}

/**
 * 同一匹配文本有多个术语时，决定默认展示顺序
 * 1. 完全命中 canonical 的优先
 * 2. priority 数字小的优先（1 最高）
 * 3. 最后按 id 稳定排序
 */
function rankTermIds(trie: TermTrie, termIds: string[], matchedText: string): string[] {
  return [...termIds].sort((firstId, secondId) => {
    const first = trie.termMap.get(firstId);
    const second = trie.termMap.get(secondId);
    if (!first) return 1;
    if (!second) return -1;

    const firstExact = trie.canonicalKeys.get(firstId) === matchedText;
    const secondExact = trie.canonicalKeys.get(secondId) === matchedText;
    if (firstExact !== secondExact) return firstExact ? -1 : 1;

    const firstPriority = first.priority ?? Number.MAX_SAFE_INTEGER;
    const secondPriority = second.priority ?? Number.MAX_SAFE_INTEGER;
    if (firstPriority !== secondPriority) return firstPriority - secondPriority;

    return firstId.localeCompare(secondId);
  });
}

/**
 * 匹配一句文本中的术语
 */
export function matchTerms(
  trie: TermTrie,
  input: string,
  maxMatches = MAX_TERM_MATCHES,
): TermMatch[] {
  const { text, starts, ends } = normalizeWithMap(input);
  const candidates: TermMatch[] = [];
  const seen = new Set<string>();

  collectTrieCandidates(trie, trie.root.children, text, text, starts, ends, seen, candidates);
  collectTrieCandidates(
    trie,
    trie.ciRoot.children,
    text.toLowerCase(),
    text,
    starts,
    ends,
    seen,
    candidates,
  );

  candidates.sort(
    (first, second) =>
      second.end - second.start - (first.end - first.start) || first.start - second.start,
  );

  const matches: TermMatch[] = [];
  candidates.forEach(candidate => {
    const overlaps = matches.some(item => candidate.start < item.end && candidate.end > item.start);
    if (!overlaps) matches.push(candidate);
  });

  return matches.sort((first, second) => first.start - second.start).slice(0, maxMatches);
}

function collectTrieCandidates(
  trie: TermTrie,
  rootChildren: Map<string, TermTrieNode>,
  matchText: string,
  originalText: string,
  starts: number[],
  ends: number[],
  seen: Set<string>,
  candidates: TermMatch[],
) {
  for (let start = 0; start < matchText.length; start++) {
    let node: TermTrieNode | undefined = { children: rootChildren };

    for (let end = start; end < matchText.length; end++) {
      node = node.children.get(matchText[end]);
      if (!node) break;

      if (!node.termIds?.length || !hasValidBoundary(matchText, start, end + 1)) continue;

      const key = `${start}:${end + 1}:${node.termIds.join(',')}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const matchedText = originalText.slice(start, end + 1);
      const termIds = rankTermIds(trie, node.termIds, matchedText);
      candidates.push({
        start: starts[start],
        end: ends[end],
        termId: termIds[0],
        termIds,
      });
    }
  }
}

/**
 * 将原文切分为普通文本和术语片段
 */
export function toSegments(text: string, matches: TermMatch[]): TermSegment[] {
  const segments: TermSegment[] = [];
  let cursor = 0;

  matches.forEach(match => {
    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start) });
    }
    segments.push({
      text: text.slice(match.start, match.end),
      termId: match.termId,
      termIds: match.termIds,
    });
    cursor = match.end;
  });

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
}
