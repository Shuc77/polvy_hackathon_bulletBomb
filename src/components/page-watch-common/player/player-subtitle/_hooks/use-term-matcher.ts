/**
 * @file 术语匹配器缓存与字幕切片
 */
import { computed } from 'vue';
import type { Ref } from 'vue';
import { getTermsByTrack } from '@/assets/term-dictionaries';
import { buildTrie, matchTerms, toSegments } from '@/core/term/term-matcher';
import type { TermTrie, TermTrack } from '@/core/term/term-matcher';
import { resolveTermTrack } from '@/core/term/term-options';

const trieCache = new Map<TermTrack, TermTrie>();

export function getTermTrie(track: TermTrack): TermTrie {
  const cached = trieCache.get(track);
  if (cached) return cached;

  const trie = buildTrie(getTermsByTrack(track));
  trieCache.set(track, trie);
  return trie;
}

export function useTermMatcher() {
  const track = resolveTermTrack();
  const trie = getTermTrie(track);
  const segmentsOfText = (text: string) => toSegments(text, matchTerms(trie, text));
  const segmentsOf = (text: Ref<string>) => computed(() => segmentsOfText(text.value));

  return { track, trie, segmentsOf, segmentsOfText };
}
