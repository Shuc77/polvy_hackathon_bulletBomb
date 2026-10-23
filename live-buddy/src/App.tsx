import { useEffect, useState } from 'react';
import { FlaskConical, Headphones, ShieldCheck, Sparkles } from 'lucide-react';
import { DemoControls } from './components/DemoControls';
import { LiveStage, StageSidebar } from './components/LiveStage';
import { PetPanel, type PetPanelTab } from './components/PetPanel';
import { PetWidget } from './components/PetWidget';
import { useLiveBuddy } from './hooks/useLiveBuddy';
import { polyvAdapter } from './lib/polyvAdapter';

export default function App() {
  const buddy = useLiveBuddy();
  const [demoToolsOpen, setDemoToolsOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<PetPanelTab>('chat');
  const isDemo = buddy.mode === 'demo';

  useEffect(() => {
    if (!buddy.notice) return;
    const timer = setTimeout(buddy.clearNotice, 3200);
    return () => clearTimeout(timer);
  }, [buddy.clearNotice, buddy.notice]);

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="site-header">
        <a className="brand" href="/" aria-label="直播小伙伴首页">
          <span className="brand__icon">
            <Sparkles size={17} />
          </span>
          <span className="brand__name">Live Buddy</span>
          <span className="brand__divider" />
          <span className="brand__cn">直播小伙伴</span>
        </a>
        <div className="site-header__right">
          <span className="app-id">AppID · {polyvAdapter.appId}</span>
          <button
            className="header-button"
            type="button"
            onClick={() => setDemoToolsOpen(true)}
          >
            <FlaskConical size={15} />
            事件控制台
          </button>
          <div className="viewer-avatar">徐</div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-intro">
          <div>
            <div className="page-intro__kicker">
              <span className={`mode-chip mode-chip--${buddy.mode}`}>
                {isDemo ? '演示数据' : '真实场次'}
              </span>
              <span>{isDemo ? '可直接体验全部交互' : `场次 ${buddy.sessionId}`}</span>
            </div>
            <h1>边看直播，边把知识留下。</h1>
            <p>术语、课堂题目与直播上下文，都收在同一个 AI 小伙伴里。</p>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>
              <strong>按场次隔离</strong>
              12 小时自动过期
            </span>
          </div>
        </div>

        <div className="watch-layout">
          <LiveStage isDemo={isDemo} onOpenDemoTools={() => setDemoToolsOpen(true)} />
          <StageSidebar
            terms={buddy.terms}
            questions={buddy.questions}
            isDemo={isDemo}
            onOpenPanel={buddy.openPanel}
          />
        </div>

        <footer className="page-footer">
          <span>
            <Headphones size={14} />
            字幕术语已接入：高亮词会实时同步到本场词库
          </span>
          <span>数据仅属于当前场次 · AI 回答需有本场依据</span>
        </footer>
      </main>

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
          isAnswering={buddy.isAnswering}
          tab={panelTab}
          onTabChange={setPanelTab}
          onClose={buddy.closePanel}
          onSend={buddy.sendMessage}
          onAddNote={buddy.addNote}
        />
      )}
      <PetWidget
        mood={buddy.petMood}
        isOpen={buddy.isOpen}
        isHovered={false}
        onOpenPanel={buddy.togglePanel}
        onQuickAsk={buddy.openPanel}
        onQuickNote={buddy.openPanel}
      />

      {buddy.notice && (
        <div className="toast" role="status">
          <Sparkles size={15} />
          {buddy.notice}
        </div>
      )}

      {demoToolsOpen && (
        <DemoControls
          sessionId={buddy.sessionId}
          mode={buddy.mode}
          onClose={() => setDemoToolsOpen(false)}
          onSessionChange={sessionId => {
            buddy.setSession(sessionId);
            setDemoToolsOpen(false);
          }}
          onModeChange={buddy.setMode}
          onInjectTerm={buddy.injectTerm}
          onInjectQuestion={buddy.injectQuestion}
          onInjectContext={buddy.injectContext}
          onReset={() => {
            buddy.resetDemoSession();
            setDemoToolsOpen(false);
          }}
        />
      )}
    </div>
  );
}
