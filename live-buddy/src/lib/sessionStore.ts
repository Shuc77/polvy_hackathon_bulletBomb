import type {
  ChatMessage,
  LiveContextLine,
  LiveNote,
  LiveQuestion,
  LiveTerm,
  RuntimeMode,
  SessionSnapshot,
} from '../types';

export const SESSION_PREFIX = 'live-buddy:v7:';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const MAX_TERMS = 80;
export const MAX_QUESTIONS = 40;
export const MAX_MESSAGES = 24;
export const MAX_CONTEXT_LINES = 80;
export const MAX_NOTES = 80;

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function normalizeTerm(term: string): string {
  return term.trim().replace(/\s+/g, ' ').toLocaleLowerCase('zh-CN');
}

export function mergeTerm(terms: LiveTerm[], incoming: LiveTerm): LiveTerm[] {
  const key = normalizeTerm(incoming.term);
  const existing = terms.find(item => normalizeTerm(item.term) === key);
  const incomingCount =
    typeof incoming.occurrences === 'number' && incoming.occurrences > 0
      ? incoming.occurrences
      : 1;

  if (existing) {
    return terms.map(item =>
      item.id === existing.id
        ? {
            ...item,
            translation: item.translation || incoming.translation,
            explanation: item.explanation || incoming.explanation,
            occurrences: (item.occurrences || 1) + incomingCount,
            lastSeenAt: incoming.lastSeenAt || incoming.capturedAt,
          }
        : item,
    );
  }

  return [{ ...incoming, occurrences: incomingCount }, ...terms].slice(0, MAX_TERMS);
}

export function mergeQuestion(
  questions: LiveQuestion[],
  incoming: LiveQuestion,
): LiveQuestion[] {
  const existing = questions.find(
    item =>
      item.id === incoming.id ||
      normalizeTerm(item.title) === normalizeTerm(incoming.title),
  );

  if (existing) {
    return questions.map(item =>
      item.id === existing.id
        ? {
            ...item,
            ...incoming,
            id: item.id,
            source: incoming.source,
          }
        : item,
    );
  }

  return [incoming, ...questions].slice(0, MAX_QUESTIONS);
}

export function mergeContextLine(
  lines: LiveContextLine[],
  incoming: LiveContextLine,
): LiveContextLine[] {
  const last = lines[lines.length - 1];
  if (
    last &&
    last.sessionId === incoming.sessionId &&
    last.text === incoming.text &&
    last.timestamp === incoming.timestamp
  ) {
    return lines;
  }
  return [...lines, incoming].slice(-MAX_CONTEXT_LINES);
}

export function appendMessage(messages: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  return [...messages, incoming].slice(-MAX_MESSAGES);
}

export function prependNote(notes: LiveNote[], incoming: LiveNote): LiveNote[] {
  return [incoming, ...notes].slice(0, MAX_NOTES);
}

export function createSnapshot(input: {
  sessionId: string;
  mode: RuntimeMode;
  terms: LiveTerm[];
  questions: LiveQuestion[];
  messages: ChatMessage[];
  notes?: LiveNote[];
  liveContext: LiveContextLine[];
  now?: number;
}): SessionSnapshot {
  const now = input.now ?? Date.now();
  return {
    version: 1,
    sessionId: input.sessionId,
    mode: input.mode,
    terms: input.terms,
    questions: input.questions,
    messages: input.messages,
    notes: input.notes || [],
    liveContext: input.liveContext,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
}

export function saveSnapshot(snapshot: SessionSnapshot): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(
      `${SESSION_PREFIX}${snapshot.mode}:${snapshot.sessionId}`,
      JSON.stringify(snapshot),
    );
    purgeExpiredSnapshots();
  } catch {
    // Storage can be unavailable in private browsing; in-memory state still works.
  }
}

export function loadSnapshot(
  sessionId: string,
  mode: RuntimeMode,
  now = Date.now(),
): SessionSnapshot | null {
  if (!storageAvailable() || !sessionId) return null;
  try {
    const key = `${SESSION_PREFIX}${mode}:${sessionId}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as SessionSnapshot;
    if (
      snapshot.version !== 1 ||
      snapshot.sessionId !== sessionId ||
      snapshot.mode !== mode ||
      snapshot.expiresAt <= now
    ) {
      window.localStorage.removeItem(key);
      return null;
    }
    return { ...snapshot, notes: Array.isArray(snapshot.notes) ? snapshot.notes : [] };
  } catch {
    return null;
  }
}

export function purgeExpiredSnapshots(now = Date.now()): string[] {
  if (!storageAvailable()) return [];
  const removed: string[] = [];
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(SESSION_PREFIX)) continue;
    try {
      const snapshot = JSON.parse(window.localStorage.getItem(key) || '') as SessionSnapshot;
      if (snapshot.expiresAt <= now) {
        window.localStorage.removeItem(key);
        removed.push(key);
      }
    } catch {
      window.localStorage.removeItem(key);
      removed.push(key);
    }
  }
  return removed;
}

export function clearSession(sessionId: string, mode: RuntimeMode): void {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(`${SESSION_PREFIX}${mode}:${sessionId}`);
}
