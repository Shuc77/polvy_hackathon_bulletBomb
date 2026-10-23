import { useEffect, useState } from 'react';
import { Expand, Radio, Settings2, Volume2 } from 'lucide-react';
import { polyvAdapter } from '../lib/polyvAdapter';

interface LiveStageProps {
  isDemo: boolean;
  onOpenDemoTools: () => void;
}

const agenda = [
  { time: '00:00', title: '为什么流量不等于增长' },
  { time: '03:52', title: '用私域承接高质量用户' },
  { time: '08:41', title: '衡量 LTV，而不只看成交' },
  { time: '13:06', title: '现场诊断与课堂练习' },
];

export function LiveStage({ isDemo, onOpenDemoTools }: LiveStageProps) {
  const [elapsed, setElapsed] = useState(16 * 60 + 42);

  useEffect(() => {
    if (!isDemo) return;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [isDemo]);

  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(
    elapsed % 60,
  ).padStart(2, '0')}`;

  if (!isDemo && polyvAdapter.watchUrl) {
    return (
      <section className="stage-card stage-card--real">
        <div className="stage-card__real-head">
          <span>
            <Radio size={14} />
            保利威真实观看页
          </span>
          <span>频道 {polyvAdapter.channelId}</span>
        </div>
        <iframe
          src={polyvAdapter.watchUrl}
          title="保利威直播观看页"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <p className="stage-card__real-note">
          当前为 iframe 预览；生产接入时需要把 Live Buddy 以脚本方式注入该观看页，事件桥的接入说明见
          docs/TEAM-INTERFACE.md。
        </p>
      </section>
    );
  }

  return (
    <section className="stage-card">
      <div className="stage-card__topbar">
        <div className="stage-brand">
          <span className="stage-brand__mark">POLYV</span>
          <span>学习直播间</span>
        </div>
        <div className="stage-status">
          <span className="live-dot" />
          直播中
          <span className="stage-status__divider" />
          {clock}
        </div>
        <button
          className="stage-demo-tag"
          type="button"
          onClick={onOpenDemoTools}
          title="打开演示事件工具"
        >
          演示画面
          <Settings2 size={13} />
        </button>
      </div>

      <div className="stage-visual">
        <div className="stage-aurora stage-aurora--one" />
        <div className="stage-aurora stage-aurora--two" />
        <div className="stage-grid" />

        <div className="presentation">
          <span className="presentation__eyebrow">GROWTH LOOP · 2026</span>
          <h1>
            从一次成交
            <br />
            到<span>长期关系</span>
          </h1>
          <p>AI 时代的高转化直播，如何把每一位观众变成持续增长的用户？</p>

          <div className="growth-loop">
            <span className="growth-loop__core">LTV</span>
            <span className="growth-loop__node growth-loop__node--one">内容钩子</span>
            <span className="growth-loop__node growth-loop__node--two">私域承接</span>
            <span className="growth-loop__node growth-loop__node--three">用户分层</span>
            <span className="growth-loop__node growth-loop__node--four">持续复购</span>
            <svg viewBox="0 0 360 230" aria-hidden="true">
              <ellipse cx="180" cy="115" rx="145" ry="92" />
              <path d="m280 57 10 15-19 2" />
            </svg>
          </div>
        </div>

        <aside className="instructor">
          <div className="instructor__screen">
            <div className="instructor__person">
              <span className="instructor__hair" />
              <span className="instructor__face">
                <i />
                <i />
              </span>
              <span className="instructor__body" />
            </div>
            <span className="instructor__badge">主讲 · 林老师</span>
          </div>
        </aside>

        <div className="caption-line">
          <span>实时字幕占位</span>
          私域不是加了多少人，而是你能不能持续为用户创造价值。
        </div>
      </div>

      <div className="stage-controls">
        <div className="stage-controls__left">
          <span className="pause-icon">
            <i />
            <i />
          </span>
          <Volume2 size={18} />
          <span className="stage-controls__time">
            <b>{clock}</b> / LIVE
          </span>
        </div>
        <div className="stage-controls__center">
          <span className="quality-button">高清</span>
          <span className="speed-button">1.0x</span>
        </div>
        <button className="stage-controls__fullscreen" type="button" aria-label="全屏">
          <Expand size={18} />
        </button>
      </div>
    </section>
  );
}

export function StageSidebar({
  terms,
  questions,
  isDemo,
  onOpenPanel,
}: {
  terms: Array<{ term: string; translation?: string }>;
  questions: Array<{ title: string }>;
  isDemo: boolean;
  onOpenPanel: () => void;
}) {
  return (
    <aside className="side-rail">
      <div className="course-card">
        <div className="course-card__badge">
          <Radio size={13} />
          {isDemo ? 'DEMO CLASS' : 'LIVE CLASS'}
        </div>
        <h2>AI 时代的高转化直播</h2>
        <p>从流量承接、私域经营到 LTV，用一套可执行的增长框架重新理解直播。</p>
        <div className="course-card__teacher">
          <span className="teacher-avatar">林</span>
          <div>
            <strong>林老师</strong>
            <span>增长策略顾问 · 本场讲师</span>
          </div>
          <button type="button" onClick={onOpenPanel}>
            问伙伴
          </button>
        </div>
      </div>

      <div className="rail-card agenda-card">
        <div className="rail-card__heading">
          <div>
            <span className="eyebrow">本场内容</span>
            <h3>直播进行到</h3>
          </div>
          <span className="rail-card__live">04 / 04</span>
        </div>
        <div className="agenda-list">
          {agenda.map((item, index) => (
            <div className={`agenda-item ${index < 3 ? 'agenda-item--done' : ''}`} key={item.time}>
              <span className="agenda-item__dot" />
              <span className="agenda-item__time">{item.time}</span>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rail-card compact-card">
        <div className="rail-card__heading">
          <div>
            <span className="eyebrow">刚刚记下</span>
            <h3>{terms.length} 个关键词</h3>
          </div>
          <button className="text-button" type="button" onClick={onOpenPanel}>
            全部
          </button>
        </div>
        <div className="mini-chip-list">
          {terms.slice(0, 4).map(term => (
            <span className="mini-chip" key={term.term}>
              {term.term}
            </span>
          ))}
          {terms.length === 0 && <span className="mini-empty">等待术语事件</span>}
        </div>
        <div className="rail-question">
          <span>课堂题目</span>
          <strong>{questions.length}</strong>
          <p>{questions[0]?.title || '老师发布题目后会出现在这里'}</p>
        </div>
      </div>
    </aside>
  );
}
