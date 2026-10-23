import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Clock3, Search, Sparkles } from 'lucide-react';
import type { LiveNote, LiveTerm } from '../types';

interface TermsViewProps {
  terms: LiveTerm[];
  notes: LiveNote[];
  isDemo: boolean;
}

function formatTimestamp(timestamp?: number): string {
  if (timestamp === undefined) return '时间未提供';
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function sourceLabel(term: LiveTerm): string {
  if (term.source === 'demo') return '演示';
  if (term.source === 'subtitle') return '字幕同步';
  return '手动记录';
}

export function TermsView({ terms, notes, isDemo }: TermsViewProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = terms.find(term => term.id === selectedId);
  const relatedNotes = selected
    ? notes.filter(note => note.termId === selected.id || note.termText === selected.term)
    : [];

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('zh-CN');
    if (!keyword) return terms;
    return terms.filter(term =>
      [term.term, term.translation, term.explanation]
        .filter(Boolean)
        .some(value => value?.toLocaleLowerCase('zh-CN').includes(keyword)),
    );
  }, [query, terms]);

  const totalOccurrences = useMemo(
    () => terms.reduce((sum, term) => sum + (term.occurrences || 1), 0),
    [terms],
  );

  if (selected) {
    return (
      <div className="panel-view term-detail">
        <button className="text-button term-detail__back" type="button" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={15} />
          返回词库
        </button>
        <div className="term-detail__hero">
          <div className="term-detail__mark">
            <BookOpen size={26} />
          </div>
          <div>
            <span className="eyebrow">{sourceLabel(selected)}</span>
            <h2>{selected.term}</h2>
            {selected.translation && <p>{selected.translation}</p>}
          </div>
        </div>
        <div className="detail-callout">
          <Sparkles size={16} />
          <p>{selected.explanation || '当前数据源还没有提供解释。'}</p>
        </div>
        <div className="detail-meta">
          <span>
            <Clock3 size={14} />
            首次出现 {formatTimestamp(selected.timestamp)}
          </span>
          <span>本场出现 {selected.occurrences || 1} 次</span>
          <span>最近命中 {formatTimestamp(selected.lastSeenAt)}</span>
          <span>场次 {selected.sessionId}</span>
        </div>
        {relatedNotes.length > 0 && (
          <div className="related-notes">
            <div className="related-notes__title">
              <Sparkles size={14} />
              相关随手记
            </div>
            {relatedNotes.map(note => (
              <p key={note.id}>{note.content}</p>
            ))}
          </div>
        )}
        <p className="fine-print">
          {isDemo
            ? '当前为演示词库，内容仅用于界面验收，不代表保利威官方课程解释。'
            : '解释来自本场真实数据源；未提供的字段不会由前端补造。'}
        </p>
      </div>
    );
  }

  return (
    <div className="panel-view">
      <div className="panel-view__heading">
        <div>
          <span className="eyebrow">本场术语 · 实时统计</span>
          <h2>听懂每一个关键词</h2>
        </div>
        <span
          className="count-pill"
          title={`${terms.length} 个术语，共出现 ${totalOccurrences} 次`}
        >
          {terms.length}
        </span>
      </div>

      <label className="search-field">
        <Search size={17} />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="搜索术语、翻译或解释"
          aria-label="搜索本场术语"
        />
      </label>

      {filtered.length > 0 ? (
        <div className="term-list">
          {filtered.map((term, index) => (
            <button
              className="term-card"
              type="button"
              key={term.id}
              onClick={() => setSelectedId(term.id)}
              style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
            >
              <span className="term-card__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="term-card__body">
                <span className="term-card__title-row">
                  <strong>{term.term}</strong>
                  <span className={`source-tag source-tag--${term.source}`}>{sourceLabel(term)}</span>
                  {(term.occurrences || 1) > 1 && (
                    <span className="occurrence-tag">×{term.occurrences}</span>
                  )}
                </span>
                <span className="term-card__translation">
                  {term.translation || '暂无翻译'}
                </span>
                <span className="term-card__preview">
                  {term.explanation || '点击查看本场记录'}
                </span>
              </span>
              <span className="term-card__time">{formatTimestamp(term.timestamp)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <BookOpen size={24} />
          </div>
          <h3>{query ? '没有匹配的术语' : '还没有收到术语'}</h3>
          <p>
            {query
              ? '换个关键词试试。'
              : '字幕模块识别到专业术语后，会通过事件自动同步到这里。'}
          </p>
        </div>
      )}
    </div>
  );
}
