import { useCallback, useEffect, useRef, useState } from 'react';
import { aiEndpoint, initialSessionId, runtimeMode, seedDemoData } from '../config';
import { DEMO_SESSION_ID, demoQuestions, demoTerms } from '../data/demo';
import { LIVE_BUDDY_EVENTS } from '../lib/polyvAdapter';
import {
  appendMessage,
  clearSession,
  createSnapshot,
  loadSnapshot,
  mergeContextLine,
  mergeQuestion,
  mergeTerm,
  normalizeTerm,
  prependNote,
  saveSnapshot,
} from '../lib/sessionStore';
import type {
  AiResponse,
  ChatMessage,
  LiveQuestion,
  LiveNote,
  LiveQuestionEvent,
  LiveTerm,
  LiveTermEvent,
  LiveContextEvent,
  LiveContextLine,
  PetMood,
  RuntimeMode,
} from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialData(sessionId: string, mode: RuntimeMode) {
  const stored = loadSnapshot(sessionId, mode);
  if (stored?.mode === mode) {
    return {
      terms: stored.terms,
      questions: stored.questions,
      messages: stored.messages,
      notes: stored.notes,
      liveContext: stored.liveContext,
    };
  }
  const useSeededDemo =
    mode === 'demo' && (sessionId === DEMO_SESSION_ID || seedDemoData);
  return {
    terms: useSeededDemo
      ? demoTerms.map(term => ({ ...term, id: `${term.id}-${sessionId}`, sessionId }))
      : [],
    questions: useSeededDemo
      ? demoQuestions.map(question => ({
          ...question,
          id: `${question.id}-${sessionId}`,
          sessionId,
        }))
      : [],
    messages: [] as ChatMessage[],
    notes: [] as LiveNote[],
    liveContext: [] as LiveContextLine[],
  };
}

export function useLiveBuddy() {
  const fallbackSessionId = initialSessionId || 'unconfigured-live-session';
  const [sessionId, setSessionIdState] = useState(fallbackSessionId);
  const [mode, setModeState] = useState<RuntimeMode>(runtimeMode);
  const [initial] = useState(() => initialData(fallbackSessionId, runtimeMode));
  const [terms, setTerms] = useState<LiveTerm[]>(initial.terms);
  const [questions, setQuestions] = useState<LiveQuestion[]>(initial.questions);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [notes, setNotes] = useState<LiveNote[]>(initial.notes);
  const [liveContext, setLiveContext] = useState<LiveContextLine[]>(initial.liveContext);
  const [petMood, setPetMood] = useState<PetMood>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [notice, setNotice] = useState('');
  const moodTimer = useRef<ReturnType<typeof setTimeout>>();
  const hydrated = useRef(false);
  const knownTermKeys = useRef(
    new Set(initial.terms.map(term => normalizeTerm(term.term))),
  );

  const pulseMood = useCallback((mood: PetMood, duration = 2400) => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setPetMood(mood);
    moodTimer.current = setTimeout(() => setPetMood('idle'), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (moodTimer.current) clearTimeout(moodTimer.current);
    };
  }, []);

  useEffect(() => {
    const next = initialData(sessionId, mode);
    setTerms(next.terms);
    setQuestions(next.questions);
    setMessages(next.messages);
    setNotes(next.notes);
    setLiveContext(next.liveContext);
    knownTermKeys.current = new Set(next.terms.map(term => normalizeTerm(term.term)));
    hydrated.current = true;
  }, [sessionId, mode]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveSnapshot(
      createSnapshot({
        sessionId,
        mode,
        terms,
        questions,
        messages,
        notes,
        liveContext,
      }),
    );
  }, [sessionId, mode, terms, questions, messages, notes, liveContext]);

  const injectTerm = useCallback(
    (event: LiveTermEvent) => {
      if (!event.term?.trim()) return;
      if (event.sessionId !== sessionId) {
        setNotice(`已忽略其他场次（${event.sessionId}）的术语事件`);
        return;
      }
      const term = event.term.trim();
      const termKey = normalizeTerm(term);
      const isNewTerm = !knownTermKeys.current.has(termKey);
      const incoming: LiveTerm = {
        id: uid('term'),
        sessionId,
        term,
        translation: event.translation?.trim(),
        explanation: event.explanation?.trim(),
        timestamp: event.timestamp,
        occurrences:
          typeof event.occurrences === 'number' && event.occurrences > 0
            ? event.occurrences
            : 1,
        lastSeenAt: Date.now(),
        source: event.source || 'manual',
        capturedAt: Date.now(),
      };
      knownTermKeys.current.add(termKey);
      setTerms(previous => mergeTerm(previous, incoming));
      // 新术语只让宠物做一个发现动作；同一术语再次出现时只累计次数，不打断宠物
      if (isNewTerm) pulseMood('discovering');
    },
    [pulseMood, sessionId],
  );

  const injectQuestion = useCallback(
    (event: LiveQuestionEvent) => {
      if (!event.title?.trim()) return;
      if (event.sessionId !== sessionId) {
        setNotice(`已忽略其他场次（${event.sessionId}）的题目事件`);
        return;
      }
      const incoming: LiveQuestion = {
        id: event.id || uid('question'),
        sessionId,
        title: event.title.trim(),
        options: event.options,
        correctAnswers: event.correctAnswers,
        explanation: event.explanation,
        status: event.status || 'unknown',
        answerVisible: event.answerVisible ?? false,
        submittedAnswers: event.submittedAnswers,
        source: event.source || 'manual',
        askedAt: event.askedAt || Date.now(),
      };
      setQuestions(previous => mergeQuestion(previous, incoming));
      pulseMood('discovering');
      setNotice('新的课堂题目已记入本场回看列表');
    },
    [pulseMood, sessionId],
  );

  const injectContext = useCallback(
    (event: LiveContextEvent) => {
      if (event.sessionId !== sessionId || !event.text?.trim()) return;
      setLiveContext(previous =>
        mergeContextLine(previous, {
          sessionId,
          text: event.text.trim(),
          timestamp: event.timestamp,
        }),
      );
    },
    [sessionId],
  );

  const setSession = useCallback((nextSessionId: string) => {
    const clean = nextSessionId.trim().slice(0, 160);
    if (!clean) return;
    setSessionIdState(clean);
    setNotice(`已切换到场次 ${clean}`);
  }, []);

  const setMode = useCallback((nextMode: RuntimeMode) => {
    setModeState(nextMode);
    setNotice(nextMode === 'demo' ? '已切换到演示模式' : '已切换到真实模式');
  }, []);

  const addNote = useCallback(
    (
      content: string,
      metadata: {
        timestamp?: number;
        termId?: string;
        termText?: string;
        questionId?: string;
        questionTitle?: string;
        source: 'quick' | 'manual';
      },
    ) => {
      const clean = content.trim();
      if (!clean) return null;
      const note: LiveNote = {
        id: uid('note'),
        sessionId,
        content: clean.slice(0, 500),
        createdAt: Date.now(),
        ...metadata,
      };
      setNotes(previous => prependNote(previous, note));
      return note;
    },
    [sessionId],
  );

  const sendMessage = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || isAnswering) return null;

      const userMessage: ChatMessage = {
        id: uid('msg'),
        role: 'user',
        content: question,
        createdAt: Date.now(),
        status: 'complete',
      };
      const nextMessages = appendMessage(messages, userMessage);
      setMessages(nextMessages);
      setIsAnswering(true);
      pulseMood('thinking', 30_000);

      try {
        const response = await fetch(aiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            question,
            mode,
            terms,
            questions,
            liveContext,
            messages,
          }),
        });
        const data = (await response.json()) as AiResponse & { error?: string; code?: string };
        if (!response.ok) throw new Error(data.error || 'AI 请求失败');

        const assistantMessage: ChatMessage = {
          id: uid('msg'),
          role: 'assistant',
          content: data.answer,
          createdAt: Date.now(),
          status: data.provider === 'demo-fallback' ? 'demo-fallback' : 'complete',
        };
        setMessages(previous => appendMessage(previous, assistantMessage));
        pulseMood('answering', 2600);
        return assistantMessage;
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: uid('msg'),
          role: 'assistant',
          content:
            error instanceof Error
              ? `这次没有回答成功：${error.message}`
              : '这次没有回答成功，请稍后重试。',
          createdAt: Date.now(),
          status: 'error',
        };
        setMessages(previous => appendMessage(previous, errorMessage));
        setPetMood('idle');
        return errorMessage;
      } finally {
        setIsAnswering(false);
      }
    },
    [isAnswering, liveContext, messages, mode, pulseMood, questions, sessionId, terms],
  );

  const resetDemoSession = useCallback(() => {
    clearSession(DEMO_SESSION_ID, 'demo');
    setSessionIdState(DEMO_SESSION_ID);
    setModeState('demo');
    setTerms(demoTerms);
    setQuestions(demoQuestions);
    setMessages([]);
    setNotes([]);
    setLiveContext([]);
    knownTermKeys.current = new Set(demoTerms.map(term => normalizeTerm(term.term)));
    setNotice('演示场次已重置');
  }, []);

  useEffect(() => {
    window.LiveBuddy = {
      injectTerm,
      injectQuestion,
      setLiveContext: injectContext,
      setSession,
      setMode,
      openPanel: () => setIsOpen(true),
      closePanel: () => setIsOpen(false),
    };

    const onTerm = (event: Event) => injectTerm((event as CustomEvent<LiveTermEvent>).detail);
    const onQuestion = (event: Event) =>
      injectQuestion((event as CustomEvent<LiveQuestionEvent>).detail);
    const onContext = (event: Event) =>
      injectContext((event as CustomEvent<LiveContextEvent>).detail);
    const onSession = (event: Event) =>
      setSession((event as CustomEvent<string>).detail);
    const onMode = (event: Event) =>
      setMode((event as CustomEvent<RuntimeMode>).detail);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    window.addEventListener(LIVE_BUDDY_EVENTS.term, onTerm);
    window.addEventListener(LIVE_BUDDY_EVENTS.question, onQuestion);
    window.addEventListener(LIVE_BUDDY_EVENTS.context, onContext);
    window.addEventListener(LIVE_BUDDY_EVENTS.session, onSession);
    window.addEventListener(LIVE_BUDDY_EVENTS.mode, onMode);
    window.addEventListener(LIVE_BUDDY_EVENTS.open, onOpen);
    window.addEventListener(LIVE_BUDDY_EVENTS.close, onClose);

    return () => {
      delete window.LiveBuddy;
      window.removeEventListener(LIVE_BUDDY_EVENTS.term, onTerm);
      window.removeEventListener(LIVE_BUDDY_EVENTS.question, onQuestion);
      window.removeEventListener(LIVE_BUDDY_EVENTS.context, onContext);
      window.removeEventListener(LIVE_BUDDY_EVENTS.session, onSession);
      window.removeEventListener(LIVE_BUDDY_EVENTS.mode, onMode);
      window.removeEventListener(LIVE_BUDDY_EVENTS.open, onOpen);
      window.removeEventListener(LIVE_BUDDY_EVENTS.close, onClose);
    };
  }, [injectContext, injectQuestion, injectTerm, setMode, setSession]);

  return {
    sessionId,
    mode,
    terms,
    questions,
    messages,
    notes,
    liveContext,
    petMood,
    isOpen,
    isAnswering,
    notice,
    clearNotice: () => setNotice(''),
    notify: setNotice,
    openPanel: () => setIsOpen(true),
    closePanel: () => setIsOpen(false),
    togglePanel: () => setIsOpen(previous => !previous),
    injectTerm,
    injectQuestion,
    injectContext,
    setSession,
    setMode,
    sendMessage,
    addNote,
    resetDemoSession,
  };
}
