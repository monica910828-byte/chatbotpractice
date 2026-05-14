import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { sendMessage, type Message } from '../api/chat';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 영어 단어 퀴즈 챗봇입니다. 어떤 주제나 난이도로 공부하고 싶으신가요? (예: 여행, 비즈니스, 초급 등)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendMessage(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <div className="header-icon">
          <Bot size={24} />
        </div>
        <div className="header-info">
          <h1>영단어 퀴즈 봇</h1>
          <p>오늘의 단어 3개를 학습해보세요!</p>
        </div>
        <button className="reset-btn" onClick={() => setMessages([{ role: 'assistant', content: '어떤 주제나 난이도로 공부하고 싶으신가요?' }])} title="대화 초기화">
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role} animate-fade-in`}>
            <div className="avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant animate-fade-in">
            <div className="avatar">
              <Bot size={16} />
            </div>
            <div className="message-content loading">
              <Loader2 className="spinner" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          className="send-btn"
        >
          <Send size={20} />
        </button>
      </div>

      <style>{`
        .chatbot-container {
          width: 100%;
          max-width: 600px;
          height: 80vh;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .chatbot-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          background: rgba(99, 102, 241, 0.05);
        }

        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .header-info {
          flex: 1;
          text-align: left;
        }

        .header-info h1 {
          font-size: 1.1rem;
          margin: 0;
          font-weight: 700;
          color: var(--text-main);
        }

        .header-info p {
          font-size: 0.8rem;
          margin: 0;
          color: var(--text-muted);
        }

        .reset-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-wrapper {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user .avatar {
          background: var(--primary);
          color: white;
        }

        .assistant .avatar {
          background: var(--border);
          color: var(--text-muted);
        }

        .message-content {
          padding: 0.85rem 1.1rem;
          border-radius: 18px;
          font-size: 0.95rem;
          text-align: left;
          line-height: 1.5;
        }

        .user .message-content {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .assistant .message-content {
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
          color: var(--text-main);
        }

        .message-content p {
          margin: 0;
        }

        .message-content p + p {
          margin-top: 0.5rem;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.85rem 1.5rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .input-area {
          padding: 1.25rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          background: rgba(255, 255, 255, 0.02);
        }

        textarea {
          flex: 1;
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 0.75rem 1rem;
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.95rem;
          resize: none;
          max-height: 150px;
          transition: border-color 0.2s;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .send-btn {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
