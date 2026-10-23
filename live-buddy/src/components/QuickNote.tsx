import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, NotebookPen } from 'lucide-react';

interface QuickNoteProps {
  timestamp?: number;
  onSave: (content: string) => void;
  onClose: () => void;
}

function formatTime(timestamp?: number): string {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return '';
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function QuickNote({ timestamp, onSave, onClose }: QuickNoteProps) {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(onClose, 900);
    return () => clearTimeout(timer);
  }, [onClose, saved]);

  function save() {
    const content = value.trim();
    if (!content || saved) return;
    onSave(content);
    setSaved(true);
  }

  return (
    <div className={`quick-note ${saved ? 'quick-note--saved' : ''}`}>
      <span className="quick-note__icon">
        {saved ? <Check size={17} /> : <NotebookPen size={17} />}
      </span>
      {saved ? (
        <span className="quick-note__saved">
          已记入随手记
          {timestamp !== undefined && <small> · {formatTime(timestamp)}</small>}
        </span>
      ) : (
        <>
          <input
            ref={inputRef}
            value={value}
            maxLength={500}
            onChange={event => setValue(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') save();
              if (event.key === 'Escape') onClose();
            }}
            placeholder="记下此刻的想法、重点或疑问…"
            aria-label="随手记内容"
          />
          <span className="quick-note__time">{formatTime(timestamp) || '--:--'}</span>
          <button type="button" onClick={save} disabled={!value.trim()} aria-label="保存随手记">
            <ArrowUp size={17} />
          </button>
        </>
      )}
    </div>
  );
}
