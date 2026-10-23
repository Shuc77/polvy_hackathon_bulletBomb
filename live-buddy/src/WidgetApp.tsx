import { useEffect, useState } from 'react';
import { PetPanel, type PetPanelTab } from './components/PetPanel';
import { PetWidget } from './components/PetWidget';
import { QuickAsk, type QuickAskStatus } from './components/QuickAsk';
import { QuickNote } from './components/QuickNote';
import { useLiveBuddy } from './hooks/useLiveBuddy';
import type {
  LiveContextEvent,
  LiveQuestionEvent,
  LiveTermEvent,
} from './types';

type HostMessage =
  | { type: 'live-buddy:term'; detail: LiveTermEvent }
  | { type: 'live-buddy:question'; detail: LiveQuestionEvent }
  | { type: 'live-buddy:context'; detail: LiveContextEvent }
  | { type: 'live-buddy:hover'; hover: boolean }
  | { type: 'live-buddy:poke' }
  | { type: 'live-buddy:quick' }
  | { type: 'live-buddy:note' }
  | { type: 'live-buddy:note-context'; timestamp?: number }
  | { type: 'live-buddy:close-quick' }
  | { type: 'live-buddy:drag-state'; dragging: boolean; direction: 'left' | 'right' | null }
  | { type: 'live-buddy:ask'; question: string }
  | { type: 'live-buddy:open' }
  | { type: 'live-buddy:close' };

export function WidgetApp() {
  const buddy = useLiveBuddy();
  const [panelTab, setPanelTab] = useState<PetPanelTab>('chat');
  const [quickOpen, setQuickOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [playbackTime, setPlaybackTime] = useState<number>();
  const [quickStatus, setQuickStatus] = useState<QuickAskStatus>('input');
  const [quickQuestion, setQuickQuestion] = useState('');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [pokeSignal, setPokeSignal] = useState(0);
  const [dragState, setDragState] = useState<{
    dragging: boolean;
    direction: 'left' | 'right' | null;
  }>({ dragging: false, direction: null });
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const layout = buddy.isOpen ? 'panel' : quickOpen || noteOpen ? 'quick' : 'closed';
    window.parent.postMessage(
      { type: 'live-buddy:resize', layout },
      window.location.origin,
    );
  }, [buddy.isOpen, noteOpen, quickOpen]);

  useEffect(() => {
    function onMessage(event: MessageEvent<HostMessage>) {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      const message = event.data;
      if (!message || typeof message !== 'object') return;
      if (message.type === 'live-buddy:term') buddy.injectTerm(message.detail);
      if (message.type === 'live-buddy:question') buddy.injectQuestion(message.detail);
      if (message.type === 'live-buddy:context') buddy.injectContext(message.detail);
      if (message.type === 'live-buddy:hover') setIsHovered(message.hover);
      if (message.type === 'live-buddy:poke') setPokeSignal(previous => previous + 1);
      if (message.type === 'live-buddy:quick') openQuickAsk();
      if (message.type === 'live-buddy:note') openQuickNote();
      if (message.type === 'live-buddy:note-context') setPlaybackTime(message.timestamp);
      if (message.type === 'live-buddy:close-quick') {
        setQuickOpen(false);
        setNoteOpen(false);
      }
      if (message.type === 'live-buddy:drag-state') {
        setDragState({ dragging: message.dragging, direction: message.direction });
      }
      if (message.type === 'live-buddy:ask') {
        const question = message.question?.trim();
        if (question) {
          setQuickOpen(false);
          setNoteOpen(false);
          setPanelTab('chat');
          buddy.openPanel();
          if (!buddy.isAnswering) void buddy.sendMessage(question);
        }
      }
      if (message.type === 'live-buddy:open') {
        setQuickOpen(false);
        setNoteOpen(false);
        setPanelTab('chat');
        buddy.openPanel();
      }
      if (message.type === 'live-buddy:close') buddy.closePanel();
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [
    buddy.closePanel,
    buddy.injectContext,
    buddy.injectQuestion,
    buddy.injectTerm,
    buddy.isAnswering,
    buddy.openPanel,
    buddy.sendMessage,
    noteOpen,
    quickOpen,
  ]);

  function openQuickAsk() {
    if (quickOpen) {
      setQuickOpen(false);
      return;
    }
    buddy.closePanel();
    setNoteOpen(false);
    setQuickOpen(true);
    setQuickQuestion('');
    setQuickAnswer('');
    setQuickStatus('input');
  }

  function openQuickNote() {
    if (noteOpen) {
      setNoteOpen(false);
      return;
    }
    buddy.closePanel();
    setQuickOpen(false);
    setNoteOpen(true);
  }

  function openMainPanel() {
    setQuickOpen(false);
    setNoteOpen(false);
    setPanelTab('chat');
    buddy.openPanel();
  }

  async function submitQuickAsk(question: string) {
    setQuickQuestion(question);
    setQuickAnswer('');
    setQuickStatus('thinking');
    const [result] = await Promise.all([
      buddy.sendMessage(question),
      new Promise(resolve => setTimeout(resolve, 900)),
    ]);
    setQuickAnswer(result?.content || '这次没有拿到回答，请打开主界面重试。');
    setQuickStatus('answered');
  }

  function saveQuickNote(content: string) {
    const matchedTerm = buddy.terms.find(term => content.includes(term.term));
    buddy.addNote(content, {
      timestamp: playbackTime,
      termId: matchedTerm?.id,
      termText: matchedTerm?.term,
      source: 'quick',
    });
  }

  return (
    <div
      className={`widget-root ${quickOpen || noteOpen ? 'widget-root--quick' : ''} ${
        dragState.dragging ? 'widget-root--dragging' : ''
      }`}
    >
      {buddy.isOpen && (
        <PetPanel
          mode={buddy.mode}
          sessionId={buddy.sessionId}
          mood={buddy.petMood}
          terms={buddy.terms}
          questions={buddy.questions}
          messages={buddy.messages}
          notes={buddy.notes}
          liveContext={buddy.liveContext}
          playbackTime={playbackTime}
          isAnswering={buddy.isAnswering}
          tab={panelTab}
          onTabChange={setPanelTab}
          onClose={buddy.closePanel}
          onSend={buddy.sendMessage}
          onAddNote={buddy.addNote}
        />
      )}
      {noteOpen && !buddy.isOpen && (
        <QuickNote
          timestamp={playbackTime}
          onSave={saveQuickNote}
          onClose={() => setNoteOpen(false)}
        />
      )}
      {quickOpen && !buddy.isOpen && (
        <QuickAsk
          status={quickStatus}
          question={quickQuestion}
          answer={quickAnswer}
          onSubmit={submitQuickAsk}
          onClose={() => setQuickOpen(false)}
          onOpenResult={openMainPanel}
          onCursorMove={setGaze}
        />
      )}
      <PetWidget
        mood={buddy.petMood}
        isOpen={buddy.isOpen}
        isHovered={isHovered}
        pokeSignal={pokeSignal}
        isDragging={dragState.dragging}
        dragDirection={dragState.direction}
        gaze={gaze}
        onOpenPanel={openMainPanel}
        onQuickAsk={openQuickAsk}
        onQuickNote={openQuickNote}
      />
    </div>
  );
}
