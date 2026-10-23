import { useId } from 'react';
import polyvLogo from '../assets/polyv-ai-logo.jpg';
import type { PetMood } from '../types';

interface PetAvatarProps {
  mood: PetMood;
  compact?: boolean;
  gaze?: { x: number; y: number };
}

export function PetAvatar({ mood, compact = false, gaze = { x: 0, y: 0 } }: PetAvatarProps) {
  const id = useId().replace(/:/g, '');
  const body = `body-${id}`;
  const rim = `rim-${id}`;
  const glow = `glow-${id}`;

  return (
    <div
      className={`pet-avatar pet-avatar--${mood} ${compact ? 'pet-avatar--compact' : ''}`}
      style={
        {
          '--gaze-x': gaze.x.toFixed(3),
          '--gaze-y': gaze.y.toFixed(3),
        } as React.CSSProperties
      }
    >
      <span className="pet-avatar__shadow" />
      <span className="pet-avatar__orbit pet-avatar__orbit--one" />
      <span className="pet-avatar__orbit pet-avatar__orbit--two" />

      <svg viewBox="0 0 190 190" role="img" aria-label="直播小伙伴 AI 小宠物">
        <defs>
          <linearGradient id={body} x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#81a8ff" />
            <stop offset="45%" stopColor="#4d7ff4" />
            <stop offset="100%" stopColor="#315bd9" />
          </linearGradient>
          <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c5d9ff" />
            <stop offset="100%" stopColor="#6a8efa" />
          </linearGradient>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="#dff6ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dff6ff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`belly-logo-${id}`}>
            <circle cx="96" cy="140" r="16" />
          </clipPath>
        </defs>

        <ellipse cx="96" cy="174" rx="45" ry="7" fill="#17346b" opacity="0.13" />

        <g className="pet-avatar__body">
          <path d="M96 35V20" stroke="#76a8ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="96" cy="15" r="5" fill="#5ee8e3" stroke="#ddfcff" strokeWidth="2" />
          <path
            d="M47 67c-9-7-14-17-8-24 5-6 15-4 22 2 5-15 17-23 34-23s30 8 35 23c8-6 18-8 23-1 6 7 0 17-9 24 10 8 15 20 15 35 0 31-26 54-64 54-37 0-64-23-64-54 0-16 6-28 16-36z"
            fill={`url(#${body})`}
            stroke="#bfd4ff"
            strokeWidth="3"
          />
          <ellipse cx="68" cy="54" rx="27" ry="18" fill={`url(#${glow})`} opacity="0.7" />

          <path
            className="pet-avatar__hand pet-avatar__hand--left"
            d="M45 106c-16 4-23 14-18 21 5 7 16 4 25-4"
            fill="none"
            stroke="#3d6ee8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            className="pet-avatar__hand pet-avatar__hand--right"
            d="M145 106c16 4 23 14 18 21-5 7-16 4-25-4"
            fill="none"
            stroke="#3d6ee8"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <rect
            className="pet-avatar__visor"
            x="40"
            y="62"
            width="110"
            height="68"
            rx="25"
            fill="#193364"
            stroke={`url(#${rim})`}
            strokeWidth="4"
          />
          <rect x="50" y="72" width="90" height="48" rx="17" fill="#10254d" />

          <g className="pet-avatar__screen-idle">
            <g className="pet-avatar__eye-track">
              <rect className="pet-avatar__eye" x="70" y="84" width="13" height="22" rx="6" fill="#58e8dd" />
              <rect className="pet-avatar__eye" x="108" y="84" width="13" height="22" rx="6" fill="#58e8dd" />
            </g>
            <path d="M82 110c5 4 13 4 18 0" fill="none" stroke="#58e8dd" strokeWidth="3" strokeLinecap="round" />
          </g>

          <g className="pet-avatar__screen-code">
            <path d="m72 89-8 8 8 8M118 89l8 8-8 8" fill="none" stroke="#5ce9dd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M88 109h21" stroke="#5ce9dd" strokeWidth="4" strokeLinecap="round" />
          </g>

          <g className="pet-avatar__screen-think">
            <circle cx="76" cy="98" r="4" fill="#5ce9dd" />
            <circle cx="96" cy="98" r="4" fill="#5ce9dd" opacity="0.75" />
            <circle cx="116" cy="98" r="4" fill="#5ce9dd" opacity="0.45" />
          </g>

          <ellipse className="pet-avatar__foot pet-avatar__foot--left" cx="72" cy="156" rx="17" ry="10" fill="#244fc5" />
          <ellipse className="pet-avatar__foot pet-avatar__foot--right" cx="120" cy="156" rx="17" ry="10" fill="#244fc5" />
          <circle cx="96" cy="140" r="17" fill="#eef5ff" />
          <image
            className="pet-avatar__belly-logo"
            href={polyvLogo}
            x="80"
            y="124"
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#belly-logo-${id})`}
          />
        </g>
      </svg>
    </div>
  );
}
