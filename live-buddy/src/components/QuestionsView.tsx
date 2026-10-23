import { useState } from 'react';
import { ArrowLeft, Check, CircleHelp, Eye, LockKeyhole } from 'lucide-react';
import type { LiveNote, LiveQuestion } from '../types';

interface QuestionsViewProps {
  questions: LiveQuestion[];
  notes: LiveNote[];
  isDemo: boolean;
}

function statusText(question: LiveQuestion): string {
  if (question.status === 'open') return '进行中';
  if (question.status === 'closed') return '已结束 · 可回看';
  return '状态未知';
}

export function QuestionsView({ questions, notes, isDemo }: QuestionsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = questions.find(question => question.id === selectedId);
  const relatedNotes = selected
    ? notes.filter(
        note => note.questionId === selected.id || note.questionTitle === selected.title,
      )
    : [];

  if (selected) {
    const submitted = selected.submittedAnswers || [];
    return (
      <div className="panel-view question-detail">
        <button className="text-button question-detail__back" type="button" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={15} />
          返回题目
        </button>
        <div className="question-detail__meta">
          <span className={`status-pill status-pill--${selected.status}`}>
            {statusText(selected)}
          </span>
          <span>{selected.source === 'demo' ? '演示数据' : '真实事件'}</span>
        </div>
        <h2>{selected.title}</h2>
        <div className="option-list">
          {(selected.options || []).map(option => {
            const isCorrect = selected.correctAnswers?.includes(option.key);
            const isSubmitted = submitted.includes(option.key);
            const revealCorrect = selected.answerVisible && isCorrect;
            return (
              <div
                className={`option-card ${isSubmitted ? 'option-card--submitted' : ''} ${
                  revealCorrect ? 'option-card--correct' : ''
                }`}
                key={option.key}
              >
                <span className="option-card__key">{option.key}</span>
                <span>{option.text}</span>
                {isSubmitted && <span className="option-card__badge">我的选择</span>}
                {revealCorrect && <Check className="option-card__check" size={18} />}
              </div>
            );
          })}
        </div>

        {selected.answerVisible && selected.explanation ? (
          <div className="answer-card">
            <div className="answer-card__title">
              <Eye size={16} />
              老师开放的解析
            </div>
            <p>{selected.explanation}</p>
          </div>
        ) : (
          <div className="locked-card">
            <LockKeyhole size={18} />
            <div>
              <strong>答案暂未开放</strong>
              <p>当前数据源没有提供可展示的答案或解析，宠物不会擅自推测。</p>
            </div>
          </div>
        )}
        <p className="fine-print">
          {isDemo
            ? '这是演示题目，用于展示题目记录与答案权限状态。'
            : '真实题目的答案展示完全取决于老师与数据源权限。'}
        </p>
        {relatedNotes.length > 0 && (
          <div className="related-notes">
            <div className="related-notes__title">
              <Eye size={14} />
              相关随手记
            </div>
            {relatedNotes.map(note => (
              <p key={note.id}>{note.content}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel-view">
      <div className="panel-view__heading">
        <div>
          <span className="eyebrow">课堂题目</span>
          <h2>课后再想一遍</h2>
        </div>
        <span className="count-pill">{questions.length}</span>
      </div>
      {questions.length > 0 ? (
        <div className="question-list">
          {questions.map((question, index) => (
            <button
              className="question-card"
              type="button"
              key={question.id}
              onClick={() => setSelectedId(question.id)}
            >
              <span className="question-card__top">
                <span className="question-card__number">Q{questions.length - index}</span>
                <span className={`status-pill status-pill--${question.status}`}>
                  {statusText(question)}
                </span>
              </span>
              <strong>{question.title}</strong>
              <span className="question-card__footer">
                <span>{question.options?.length || 0} 个选项</span>
                <span>{question.answerVisible ? '答案可回看' : '答案未开放'}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <CircleHelp size={24} />
          </div>
          <h3>还没有收到题目</h3>
          <p>老师发起答题卡后，题目会通过 QuestionProvider 记入本场回看列表。</p>
        </div>
      )}
    </div>
  );
}
