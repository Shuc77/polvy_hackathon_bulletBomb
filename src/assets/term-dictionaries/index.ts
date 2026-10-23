import sampleTerms from './sample.json';
import medicalTerms from './medical.generated.json';
import { TermItem, TermTrack } from '@/core/term/term-matcher';

/** 当前支持的赛道 */
export const TERM_TRACKS: TermTrack[] = ['medical', 'trade', 'workplace'];

/** 默认赛道 */
export const DEFAULT_TERM_TRACK: TermTrack = 'medical';

function normalizeKey(value: string) {
  return value.normalize('NFKC').trim();
}

function cloneTerm(term: TermItem): TermItem {
  return {
    ...term,
    aliases: [...(term.aliases ?? [])],
  };
}

/**
 * 将 CSV 生成的医学词库作为主词库，并把示例词库中独有的词条/别名合并进来。
 * 已经存在的别名不会重复添加，避免同一别名产生无意义的重复候选。
 */
function mergeSampleMedicalTerms(primary: TermItem[], secondary: TermItem[]): TermItem[] {
  const merged = primary.map(cloneTerm);
  const keyToTerm = new Map<string, TermItem>();

  function indexTerm(term: TermItem) {
    [term.canonical, ...(term.aliases ?? [])].forEach(key => {
      const normalized = normalizeKey(key);
      if (normalized) keyToTerm.set(normalized, term);
    });
  }

  merged.forEach(indexTerm);

  secondary.forEach(term => {
    const keys = [term.canonical, ...(term.aliases ?? [])];
    const related = keys
      .map(key => keyToTerm.get(normalizeKey(key)))
      .find((item): item is TermItem => !!item);

    if (related) {
      keys.forEach(key => {
        const normalized = normalizeKey(key);
        if (!normalized || normalized === normalizeKey(related.canonical)) return;
        if (keyToTerm.has(normalized)) return;

        related.aliases = [...(related.aliases ?? []), key];
        keyToTerm.set(normalized, related);
      });
      return;
    }

    const copy = cloneTerm(term);
    merged.push(copy);
    indexTerm(copy);
  });

  return merged;
}

/** 全部术语：医学使用 CSV 词库 + 示例补充，其他赛道使用示例词库 */
export const TERM_DICTIONARY = mergeSampleMedicalTerms(
  medicalTerms as TermItem[],
  (sampleTerms as TermItem[]).filter(term => term.track === 'medical'),
);

/** 术语索引 */
export const TERM_MAP = new Map(TERM_DICTIONARY.map(term => [term.id, term]));

export function isTermTrack(value: unknown): value is TermTrack {
  return typeof value === 'string' && TERM_TRACKS.includes(value as TermTrack);
}

export function getTermsByTrack(track: TermTrack): TermItem[] {
  return TERM_DICTIONARY.filter(term => term.track === track);
}
