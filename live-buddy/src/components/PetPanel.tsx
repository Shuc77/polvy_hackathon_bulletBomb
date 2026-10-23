import { BookOpen, CircleHelp, MessageCircle, Minus, Radio, StickyNote } from 'lucide-react';
import type {
  ChatMessage,
  LiveContextLine,
  LiveQuestion,
  LiveTerm,
  LiveNote,
  PetMood,
  RuntimeMode,
} from '../types';
import { PetAvatar } from './PetAvatar';
import { TermsView } from './TermsView';
import { QuestionsView } from './QuestionsView';
import { ChatView } from './ChatView';
import { NotesView } from './NotesView';

export type PetPanelTab = 'terms' | 'questions' | 'notes' | 'chat';

interface PetPanelProps {
  mode: RuntimeMode;
  sessionId: string;
  mood: PetMood;
  terms: LiveTerm[];
  questions: LiveQuestion[];
  messages: ChatMessage[];
  notes: LiveNote[];
  liveContext: LiveContextLine[];
  playbackTime?: number;
  isAnswering: boolean;
  tab: PetPanelTab;
  onTabChange: (tab: PetPanelTab) => void;
  onClose: () => void;
  onSend: (question: string) => Promise<ChatMessage | null>;
  onAddNote: (
    content: string,
    metadata: {
      timestamp?: number;
      termId?: string;
      termText?: string;
      questionId?: string;
      questionTitle?: string;
      source: 'manual';
    },
  ) => unknown;
}

export function PetPanel({
  mode,
  sessionId,
  mood,
  terms,
  questions,
  messages,
  notes,
  liveContext,
  playbackTime,
  isAnswering,
  tab,
  onTabChange,
  onClose,
  onSend,
  onAddNote,
}: PetPanelProps) {
  return (
    <section className="pet-panel" aria-label="直播小伙伴面板">
      <div className="pet-panel__glow" />
      <header className="pet-panel__header">
        <div className="pet-panel__identity">
          <PetAvatar mood={mood} compact />
          <div>
            <div className="pet-panel__title-row">
              <strong>直播小伙伴</strong>
              <span className={`mode-chip mode-chip--${mode}`}>
                <Radio size={11} />
                {mode === 'demo' ? '演示模式' : '真实模式'}
              </span>
            </div>
            <p title={sessionId}>本场 · {sessionId}</p>
          </div>
        </div>
        <button className="icon-button" type="button" aria-label="收起面板" onClick={onClose}>
          <Minus size={19} />
        </button>
      </header>

      <nav className="pet-panel__tabs" aria-label="功能切换">
        <button
          type="button"
          className={tab === 'chat' ? 'is-active' : ''}
          onClick={() => onTabChange('chat')}
        >
          <MessageCircle size={16} />
          问 AI
        </button>
        <button
          type="button"
          className={tab === 'terms' ? 'is-active' : ''}
          onClick={() => onTabChange('terms')}
        >
          <BookOpen size={16} />
          术语
        </button>
        <button
          type="button"
          className={tab === 'questions' ? 'is-active' : ''}
          onClick={() => onTabChange('questions')}
        >
          <CircleHelp size={16} />
          题目
        </button>
        <button
          type="button"
          className={tab === 'notes' ? 'is-active' : ''}
          onClick={() => onTabChange('notes')}
        >
          <StickyNote size={16} />
          随手记
        </button>
      </nav>

      <div className="pet-panel__content">
        {tab === 'terms' && (
          <TermsView terms={terms} notes={notes} isDemo={mode === 'demo'} />
        )}
        {tab === 'questions' && (
          <QuestionsView questions={questions} notes={notes} isDemo={mode === 'demo'} />
        )}
        {tab === 'notes' && (
          <NotesView
            notes={notes}
            terms={terms}
            questions={questions}
            playbackTime={playbackTime}
            isDemo={mode === 'demo'}
            onAddNote={onAddNote}
          />
        )}
        {tab === 'chat' && (
          <ChatView
            messages={messages}
            isAnswering={isAnswering}
            onSend={onSend}
          />
        )}
      </div>
    </section>
  );
}
