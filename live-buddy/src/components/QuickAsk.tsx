import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronRight, LoaderCircle, Plus, Sparkles, Square } from 'lucide-react';

export type QuickAskStatus = 'input' | 'thinking' | 'answered';

interface QuickAskProps {
  status: QuickAskStatus;
  question: string;
  answer: string;
  onSubmit: (question: string) => void;
  onClose: () => void;
  onOpenResult: () => void;
  onCursorMove: (position: { x: number; y: number }) => void;
}

export function QuickAsk({
  status,
  question,
  answer,
  onSubmit,
  onClose,
  onOpenResult,
  onCursorMove,
}: QuickAskProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'input') inputRef.current?.focus();
  }, [status]);

  function submit() {
    const next = value.trim();
    if (!next) return;
    onSubmit(next);
  }

  function trackCursor(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    onCursorMove({ x, y });
  }

  if (status === 'answered') {
    return (
      <button
        className="quick-ask quick-ask--answered"
        type="button"
        onClick={onOpenResult}
        onPointerMove={trackCursor}
        onPointerLeave={() => onCursorMove({ x: 0, y: 0 })}
      >
        <span className="quick-ask__leading">
          <Sparkles size={16} />
        </span>
        <span className="quick-ask__answer-copy">
          <strong>{question}</strong>
          <span>
            {answer
              .replace(/【演示回答 · 未调用模型】\s*/g, '')
              .replace(/\*\*/g, '')
              .slice(0, 44)}
          </span>
        </span>
        <span className="quick-ask__action">
          <ChevronRight size={17} />
        </span>
      </button>
    );
  }

  return (
    <div
      className={`quick-ask ${
        status === 'thinking' ? 'quick-ask--thinking' : 'quick-ask--input'
      }`}
      aria-live="polite"
      onPointerMove={trackCursor}
      onPointerLeave={() => onCursorMove({ x: 0, y: 0 })}
    >
      <span className="quick-ask__leading">
        <Plus size={18} />
      </span>

      {status === 'thinking' ? (
        <>
          <span className="quick-ask__thinking-copy">
            <strong>{question}</strong>
            <span>
              <LoaderCircle size={12} className="spin" />
              正在思考
            </span>
          </span>
          <button className="quick-ask__action" type="button" aria-label="收起" onClick={onClose}>
            <Square size={12} fill="currentColor" />
          </button>
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') submit();
              if (event.key === 'Escape') onClose();
            }}
            placeholder="你想问什么？"
            aria-label="你想问什么？"
          />
          <button
            className="quick-ask__action"
            type="button"
            aria-label="发送"
            disabled={!value.trim()}
            onClick={submit}
          >
            <ArrowUp size={17} />
          </button>
        </>
      )}
    </div>
  );
}
