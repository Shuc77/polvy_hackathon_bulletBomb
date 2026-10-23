import { useState } from 'react';
import { BookOpen, CircleHelp, MessageSquareText, RotateCcw, X } from 'lucide-react';
import type {
  LiveContextEvent,
  LiveQuestionEvent,
  LiveTermEvent,
  RuntimeMode,
} from '../types';

interface DemoControlsProps {
  sessionId: string;
  mode: RuntimeMode;
  onClose: () => void;
  onSessionChange: (sessionId: string) => void;
  onModeChange: (mode: RuntimeMode) => void;
  onInjectTerm: (event: LiveTermEvent) => void;
  onInjectQuestion: (event: LiveQuestionEvent) => void;
  onInjectContext: (event: LiveContextEvent) => void;
  onReset: () => void;
}

export function DemoControls({
  sessionId,
  mode,
  onClose,
  onSessionChange,
  onModeChange,
  onInjectTerm,
  onInjectQuestion,
  onInjectContext,
  onReset,
}: DemoControlsProps) {
  const [sessionDraft, setSessionDraft] = useState(sessionId);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="demo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-tools-title"
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="demo-modal__header">
          <div>
            <span className="eyebrow">仅用于测试与演示</span>
            <h2 id="demo-tools-title">事件控制台</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </header>

        <div className="mode-switch">
          <button
            className={mode === 'demo' ? 'is-active' : ''}
            type="button"
            onClick={() => onModeChange('demo')}
          >
            演示模式
          </button>
          <button
            className={mode === 'live' ? 'is-active' : ''}
            type="button"
            onClick={() => onModeChange('live')}
          >
            真实模式
          </button>
        </div>

        <label className="field-label">
          当前场次 ID
          <div className="inline-field">
            <input
              value={sessionDraft}
              onChange={event => setSessionDraft(event.target.value)}
              placeholder="targetSessionId"
            />
            <button type="button" onClick={() => onSessionChange(sessionDraft)}>
              切换
            </button>
          </div>
        </label>

        <div className="event-grid">
          <button
            type="button"
            onClick={() =>
              onInjectTerm({
                sessionId,
                term: '增长飞轮',
                translation: 'Growth flywheel',
                explanation:
                  '让内容、触达、转化和复购互相增强的增长结构。每一轮用户反馈都会改善下一轮内容与经营动作。',
                timestamp: 1180,
                source: 'manual',
              })
            }
          >
            <BookOpen size={19} />
            <strong>注入术语</strong>
            <span>模拟队友字幕高亮事件</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onInjectQuestion({
                sessionId,
                id: `demo-injected-question-${Date.now()}`,
                title: '如果老师尚未开放答案，宠物应该怎样回答？',
                options: [
                  { key: 'A', text: '直接给出模型推测的答案' },
                  { key: 'B', text: '明确提示答案未开放' },
                ],
                status: 'closed',
                answerVisible: false,
                source: 'manual',
              })
            }
          >
            <CircleHelp size={19} />
            <strong>注入题目</strong>
            <span>测试未开放答案状态</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onInjectContext({
                sessionId,
                text: '老师刚刚强调：私域质量应看打开、互动和复购，而不是好友数量。',
                timestamp: 1204,
              })
            }
          >
            <MessageSquareText size={19} />
            <strong>注入字幕上下文</strong>
            <span>模拟字幕文本进入 AI 上下文</span>
          </button>
          <button type="button" onClick={onReset}>
            <RotateCcw size={19} />
            <strong>重置演示</strong>
            <span>清空对话并恢复初始数据</span>
          </button>
        </div>

        <p className="demo-modal__note">
          这些按钮只用于验证事件契约。切换到真实模式后，页面不会自动加载示例术语或题目。
        </p>
      </section>
    </div>
  );
}
