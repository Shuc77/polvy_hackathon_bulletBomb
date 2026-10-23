export type RuntimeMode = 'demo' | 'live';
export type PetMood = 'idle' | 'thinking' | 'discovering' | 'answering';
export type TermSource = 'subtitle' | 'manual' | 'demo';
export type QuestionSource = 'answer-card' | 'manual' | 'demo';
export type QuestionStatus = 'open' | 'closed' | 'unknown';

export interface LiveTermEvent {
  sessionId: string;
  term: string;
  translation?: string;
  explanation?: string;
  timestamp?: number;
  /** 该字幕片段里出现的次数；同一术语重复上报时累加 */
  occurrences?: number;
  source?: Exclude<TermSource, 'demo'>;
}

export interface LiveTerm extends Required<Pick<LiveTermEvent, 'sessionId' | 'term'>> {
  id: string;
  translation?: string;
  explanation?: string;
  timestamp?: number;
  /** 本场累计出现次数，旧快照没有该字段时按 1 次处理 */
  occurrences?: number;
  /** 最近一次被字幕命中的时间 */
  lastSeenAt?: number;
  source: TermSource;
  capturedAt: number;
}

export interface LiveQuestionOption {
  key: string;
  text: string;
}

export interface LiveQuestionEvent {
  sessionId: string;
  id?: string;
  title: string;
  options?: LiveQuestionOption[];
  correctAnswers?: string[];
  explanation?: string;
  status?: QuestionStatus;
  answerVisible?: boolean;
  submittedAnswers?: string[];
  source?: Exclude<QuestionSource, 'demo'>;
  askedAt?: number;
}

export interface LiveQuestion extends Omit<LiveQuestionEvent, 'id' | 'sessionId' | 'source'> {
  id: string;
  sessionId: string;
  source: QuestionSource;
  askedAt: number;
}

export interface LiveContextEvent {
  sessionId: string;
  text: string;
  timestamp?: number;
}

export interface LiveContextLine {
  sessionId: string;
  text: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status?: 'complete' | 'error' | 'demo-fallback';
}

export interface LiveNote {
  id: string;
  sessionId: string;
  content: string;
  timestamp?: number;
  termId?: string;
  termText?: string;
  questionId?: string;
  questionTitle?: string;
  source: 'quick' | 'manual';
  createdAt: number;
}

export interface SessionSnapshot {
  version: 1;
  sessionId: string;
  mode: RuntimeMode;
  terms: LiveTerm[];
  questions: LiveQuestion[];
  messages: ChatMessage[];
  notes: LiveNote[];
  liveContext: LiveContextLine[];
  updatedAt: number;
  expiresAt: number;
}

export interface AiRequest {
  sessionId: string;
  question: string;
  mode: RuntimeMode;
  terms: LiveTerm[];
  questions: LiveQuestion[];
  liveContext: LiveContextLine[];
  messages: ChatMessage[];
}

export interface AiResponse {
  answer: string;
  provider: 'model' | 'demo-fallback';
  model?: string;
}
