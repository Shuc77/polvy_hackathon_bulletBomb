/**
 * @file 术语增强运行参数
 */
import { DEFAULT_TERM_TRACK, isTermTrack } from '@/assets/term-dictionaries';
import { TermTrack } from './term-matcher';

const TERM_TRACK_STORAGE_KEY = 'plv-term-track';

/**
 * 读取当前赛道，地址参数优先于本地缓存
 */
export function resolveTermTrack(): TermTrack {
  const url = new URLSearchParams(window.location.search);
  const urlTrack = url.get('termTrack');

  if (isTermTrack(urlTrack)) {
    try {
      window.localStorage.setItem(TERM_TRACK_STORAGE_KEY, urlTrack);
    } catch (error) {
      console.warn('[term] write track to storage failed', error);
    }
    return urlTrack;
  }

  try {
    const storedTrack = window.localStorage.getItem(TERM_TRACK_STORAGE_KEY);
    if (isTermTrack(storedTrack)) return storedTrack;
  } catch (error) {
    console.warn('[term] read track from storage failed', error);
  }

  return DEFAULT_TERM_TRACK;
}

/**
 * 是否启用本地模拟字幕
 */
export function isTermDemoEnabled(): boolean {
  return new URLSearchParams(window.location.search).get('termDemo') === '1';
}
