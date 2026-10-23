import { useEffect, useRef, useState } from 'react';
import { LayoutPanelLeft, MessageCircle, Sparkles, StickyNote } from 'lucide-react';
import type { PetMood } from '../types';
import { PetAvatar } from './PetAvatar';

interface PetWidgetProps {
  mood: PetMood;
  isOpen: boolean;
  isHovered?: boolean;
  onOpenPanel: () => void;
  onQuickAsk: () => void;
  onQuickNote: () => void;
  pokeSignal?: number;
  isDragging?: boolean;
  dragDirection?: 'left' | 'right' | null;
  gaze?: { x: number; y: number };
}

const moodLabels: Record<PetMood, string> = {
  idle: '我在陪你听课',
  thinking: '正在思考',
  discovering: '发现新术语',
  answering: '正在回答',
};

export function PetWidget({
  mood,
  isOpen,
  isHovered = false,
  onOpenPanel,
  onQuickAsk,
  onQuickNote,
  pokeSignal = 0,
  isDragging = false,
  dragDirection = null,
  gaze = { x: 0, y: 0 },
}: PetWidgetProps) {
  const [top, setTop] = useState<number | null>(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [pokeVersion, setPokeVersion] = useState(0);
  const pokeTimer = useRef<ReturnType<typeof setTimeout>>();
  const drag = useRef({
    startScreenX: 0,
    startScreenY: 0,
    startY: 0,
    dragging: false,
    embedded: window.parent !== window,
  });

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const entry = event.currentTarget.closest('.pet-entry') as HTMLElement | null;
    if (!entry) return;
    drag.current.startScreenX = event.screenX;
    drag.current.startScreenY = event.screenY;
    drag.current.startY = entry.getBoundingClientRect().top;
    drag.current.dragging = false;
    event.currentTarget.setPointerCapture(event.pointerId);

    if (drag.current.embedded) {
      window.parent.postMessage(
        {
          type: 'live-buddy:drag-start',
          screenX: event.screenX,
          screenY: event.screenY,
        },
        window.location.origin,
      );
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = event.screenX - drag.current.startScreenX;
    const dy = event.screenY - drag.current.startScreenY;
    if (Math.hypot(dx, dy) < 4 && !drag.current.dragging) return;
    drag.current.dragging = true;

    if (drag.current.embedded) {
      window.parent.postMessage(
        {
          type: 'live-buddy:drag',
          screenX: event.screenX,
          screenY: event.screenY,
        },
        window.location.origin,
      );
      return;
    }

    const maxTop = Math.max(72, window.innerHeight - 196);
    setTop(Math.min(maxTop, Math.max(12, drag.current.startY + dy)));
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.current.embedded) {
      window.parent.postMessage({ type: 'live-buddy:drag-end' }, window.location.origin);
    }
  }

  function handlePetClick() {
    if (drag.current.dragging) {
      drag.current.dragging = false;
      return;
    }
    setPokeVersion(version => version + 1);
    setIsPoked(true);
    if (pokeTimer.current) clearTimeout(pokeTimer.current);
    pokeTimer.current = setTimeout(() => setIsPoked(false), 1600);
  }

  useEffect(() => {
    if (pokeSignal <= 0) return;
    setPokeVersion(version => version + 1);
    setIsPoked(true);
    if (pokeTimer.current) clearTimeout(pokeTimer.current);
    pokeTimer.current = setTimeout(() => setIsPoked(false), 1600);
  }, [pokeSignal]);

  useEffect(
    () => () => {
      if (pokeTimer.current) clearTimeout(pokeTimer.current);
    },
    [],
  );

  const showHover = isHovered || isPointerInside;

  return (
    <div
      className={`pet-entry ${isOpen ? 'pet-entry--open' : ''} ${
        showHover ? 'pet-entry--hovered' : ''
      } ${isPoked ? 'pet-entry--poked' : ''} ${
        isDragging ? 'pet-entry--dragging' : ''
      } ${dragDirection ? `pet-entry--drag-${dragDirection}` : ''}`}
      style={top === null ? undefined : { top, bottom: 'auto' }}
      onPointerEnter={() => setIsPointerInside(true)}
      onPointerLeave={() => setIsPointerInside(false)}
      onContextMenu={event => event.preventDefault()}
    >
      <div className="pet-entry__message" aria-live="polite">
        <span>{isPoked ? '哈哈，好痒！' : moodLabels[mood]}</span>
        {mood === 'discovering' && <Sparkles size={13} />}
      </div>
      <button
        className="pet-entry__button"
        type="button"
        aria-label="拖动直播小伙伴，左键挠痒"
        aria-expanded={isOpen}
        title="可随意拖动，左键挠痒"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handlePetClick}
        onContextMenu={event => event.preventDefault()}
      >
        <PetAvatar key={pokeVersion} mood={mood} gaze={gaze} />
      </button>

      <div className="pet-actions" aria-label="直播小伙伴快捷操作">
        <button
          type="button"
          className="pet-actions__button"
          aria-label="快速问 AI"
          title="快速问 AI"
          onPointerDown={event => event.stopPropagation()}
          onClick={onQuickAsk}
          onContextMenu={event => event.preventDefault()}
        >
          <MessageCircle size={17} />
        </button>
        <button
          type="button"
          className="pet-actions__button"
          aria-label="快速随手记"
          title="快速随手记"
          onPointerDown={event => event.stopPropagation()}
          onClick={onQuickNote}
          onContextMenu={event => event.preventDefault()}
        >
          <StickyNote size={17} />
        </button>
        <button
          type="button"
          className="pet-actions__button"
          aria-label="打开主界面"
          title="打开主界面"
          onPointerDown={event => event.stopPropagation()}
          onClick={onOpenPanel}
          onContextMenu={event => event.preventDefault()}
        >
          <LayoutPanelLeft size={17} />
        </button>
      </div>
    </div>
  );
}
