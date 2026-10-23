import { useMemo, useState } from 'react';
import { Clock3, Link2, NotebookPen, StickyNote } from 'lucide-react';
import type { LiveNote, LiveQuestion, LiveTerm } from '../types';

interface NotesViewProps {
  notes: LiveNote[];
  terms: LiveTerm[];
  questions: LiveQuestion[];
  playbackTime?: number;
  isDemo: boolean;
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

function formatTime(timestamp?: number): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return '--:--';
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function NotesView({
  notes,
  terms,
  questions,
  playbackTime,
  isDemo,
  onAddNote,
}: NotesViewProps) {
  const [content, setContent] = useState('');
  const [termId, setTermId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  const selectedTerm = useMemo(() => terms.find(term => term.id === termId), [termId, terms]);
  const selectedQuestion = useMemo(
    () => questions.find(question => question.id === questionId),
    [questionId, questions],
  );

  function saveNote() {
    const clean = content.trim();
    if (!clean) return;
    onAddNote(clean, {
      timestamp: playbackTime,
      termId: selectedTerm?.id,
      termText: selectedTerm?.term,
      questionId: selectedQuestion?.id,
      questionTitle: selectedQuestion?.title,
      source: 'manual',
    });
    setContent('');
    setTermId('');
    setQuestionId('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  return (
    <div className="panel-view notes-view">
      <div className="panel-view__heading">
        <div>
          <span className="eyebrow">本场随手记</span>
          <h2>记下你的想法</h2>
        </div>
        <span className="count-pill">{notes.length}</span>
      </div>

      <div className="note-composer-card">
        <div className="note-composer-card__context">
          <span>
            <Clock3 size={13} />
            {formatTime(playbackTime)}
          </span>
          <span>{isDemo ? '演示场次' : '当前直播'}</span>
        </div>
        <textarea
          value={content}
          onChange={event => setContent(event.target.value)}
          placeholder="记下重点、想法或还不明白的问题…"
          maxLength={500}
          rows={3}
          aria-label="随手记内容"
        />
        <div className="note-link-row">
          <label>
            <Link2 size={13} />
            <select value={termId} onChange={event => setTermId(event.target.value)}>
              <option value="">关联术语（可选）</option>
              {terms.map(term => (
                <option value={term.id} key={term.id}>
                  {term.term}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Link2 size={13} />
            <select value={questionId} onChange={event => setQuestionId(event.target.value)}>
              <option value="">关联题目（可选）</option>
              {questions.map((question, index) => (
                <option value={question.id} key={question.id}>
                  Q{questions.length - index} · {question.title.slice(0, 16)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" disabled={!content.trim()} onClick={saveNote}>
          <NotebookPen size={15} />
          {savedFlash ? '已记下' : '记入随手记'}
        </button>
      </div>

      {notes.length > 0 ? (
        <div className="note-list">
          {notes.map(note => (
            <article className="note-card" key={note.id}>
              <div className="note-card__top">
                <span>
                  <Clock3 size={12} />
                  {formatTime(note.timestamp)}
                </span>
                <span>{note.source === 'quick' ? '快速记录' : '详细记录'}</span>
              </div>
              <p>{note.content}</p>
              {(note.termText || note.questionTitle) && (
                <div className="note-card__links">
                  {note.termText && <span>术语 · {note.termText}</span>}
                  {note.questionTitle && <span>题目 · {note.questionTitle}</span>}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state notes-empty">
          <div className="empty-state__icon">
            <StickyNote size={24} />
          </div>
          <h3>还没有随手记</h3>
          <p>点宠物下方的笔记按钮，或直接在上方写一条。</p>
        </div>
      )}
    </div>
  );
}
