import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, LoaderCircle, UserRound } from 'lucide-react';
import type { ChatMessage } from '../types';
import { PolyvLogoAvatar } from './PolyvLogoAvatar';

interface ChatViewProps {
  messages: ChatMessage[];
  isAnswering: boolean;
  onSend: (question: string) => Promise<ChatMessage | null>;
}

const suggestions = [
  '能力图谱是什么意思？',
  '刚才那道题为什么选这个答案？',
  '现在几点？',
];

function renderMessageContent(content: string) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export function ChatView({
  messages,
  isAnswering,
  onSend,
}: ChatViewProps) {
  const [value, setValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (!hasMounted.current) {
      list.scrollTop = list.scrollHeight;
      hasMounted.current = true;
      return;
    }

    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, isAnswering]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, []);

  function submit(question = value) {
    if (!question.trim() || isAnswering) return;
    setValue('');
    void onSend(question);
  }

  return (
    <div className="chat-view">
      <div className="message-list" ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome__avatar">
              <PolyvLogoAvatar />
            </div>
            <h3>优先结合本场直播，也欢迎问其他问题</h3>
            <p>
              我会优先参考本场术语、老师题目和字幕上下文；资料不足时，也会继续用通用知识回答。
            </p>
            <div className="suggestion-list">
              {suggestions.map(suggestion => (
                <button type="button" key={suggestion} onClick={() => submit(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div className={`message message--${message.role}`} key={message.id}>
            <span
              className={`message__avatar ${
                message.role === 'assistant' ? 'message__avatar--logo' : ''
              }`}
            >
              {message.role === 'assistant' ? <PolyvLogoAvatar /> : <UserRound size={16} />}
            </span>
            <div className="message__content">
              {message.status === 'demo-fallback' && (
                <span className="message__tag">规则演示 · 未调用模型</span>
              )}
              {message.status === 'error' && <span className="message__tag message__tag--error">请求失败</span>}
              <p>{renderMessageContent(message.content)}</p>
            </div>
          </div>
        ))}

        {isAnswering && (
          <div className="message message--assistant">
            <span className="message__avatar message__avatar--logo">
              <PolyvLogoAvatar />
            </span>
            <div className="message__content message__content--loading">
              <LoaderCircle size={16} className="spin" />
              正在翻看本场资料…
            </div>
          </div>
        )}
      </div>

      <div className="chat-composer">
        <textarea
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="问直播内容，也可以问其他问题…"
          rows={2}
          aria-label="向直播小伙伴提问"
        />
        <button
          type="button"
          aria-label="发送问题"
          disabled={!value.trim() || isAnswering}
          onClick={() => submit()}
        >
          <ArrowUp size={18} />
        </button>
        <p>AI 回答仅供参考，老师答案以真实互动数据为准</p>
      </div>
    </div>
  );
}
