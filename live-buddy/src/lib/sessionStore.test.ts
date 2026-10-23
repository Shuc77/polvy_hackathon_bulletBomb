import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LiveTerm } from '../types';
import {
  SESSION_PREFIX,
  SESSION_TTL_MS,
  createSnapshot,
  loadSnapshot,
  mergeTerm,
  purgeExpiredSnapshots,
  saveSnapshot,
} from './sessionStore';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function makeTerm(overrides: Partial<LiveTerm> = {}): LiveTerm {
  return {
    id: 'term-1',
    sessionId: 'session-a',
    term: 'LTV',
    source: 'manual',
    capturedAt: 1,
    ...overrides,
  };
}

describe('sessionStore', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('window', { localStorage: storage });
  });

  it('deduplicates normalized terminology and fills missing details', () => {
    const first = makeTerm({ explanation: '' });
    const second = makeTerm({
      id: 'term-2',
      term: '  ltv ',
      translation: '用户终身价值',
      explanation: '长期净收益',
    });
    const result = mergeTerm([first], second);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('term-1');
    expect(result[0].translation).toBe('用户终身价值');
    expect(result[0].explanation).toBe('长期净收益');
  });

  it('accumulates occurrences for repeated subtitle hits', () => {
    const first = makeTerm({ source: 'subtitle', capturedAt: 100 });
    const second = makeTerm({
      id: 'term-2',
      source: 'subtitle',
      capturedAt: 200,
      occurrences: 1,
    });
    const result = mergeTerm([first], second);

    expect(result).toHaveLength(1);
    expect(result[0].occurrences).toBe(2);
    expect(result[0].lastSeenAt).toBe(200);
  });

  it('isolates snapshots by sessionId', () => {
    const now = Date.now();
    const snapshot = createSnapshot({
      sessionId: 'session-a',
      mode: 'demo',
      terms: [makeTerm()],
      questions: [],
      messages: [],
      liveContext: [],
      now,
    });
    saveSnapshot(snapshot);

    expect(loadSnapshot('session-a', 'demo', now + 200)?.terms[0].term).toBe('LTV');
    expect(loadSnapshot('session-b', 'demo', now + 200)).toBeNull();
    expect(loadSnapshot('session-a', 'live', now + 200)).toBeNull();
  });

  it('removes snapshots after the retention window', () => {
    const now = Date.now();
    const snapshot = createSnapshot({
      sessionId: 'session-a',
      mode: 'demo',
      terms: [],
      questions: [],
      messages: [],
      liveContext: [],
      now,
    });
    saveSnapshot(snapshot);

    expect(loadSnapshot('session-a', 'demo', now + SESSION_TTL_MS - 1)).not.toBeNull();
    const later = now + SESSION_TTL_MS + 1;
    saveSnapshot(
      createSnapshot({
        sessionId: 'session-b',
        mode: 'demo',
        terms: [],
        questions: [],
        messages: [],
        liveContext: [],
        now: later,
      }),
    );
    expect(loadSnapshot('session-a', 'demo', later)).toBeNull();

    saveSnapshot(snapshot);
    const removed = purgeExpiredSnapshots(later);
    expect(removed).toContain(`${SESSION_PREFIX}demo:session-a`);
  });
});
