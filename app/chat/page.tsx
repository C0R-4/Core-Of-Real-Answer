'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Send, ArrowLeft, User, Bot } from 'lucide-react';

function ChatContent() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  // 상태 관리
  const [context, setContext] = useState<any>(null);

  // 초기 메시지 설정
  useEffect(() => {
    const storedUser = sessionStorage.getItem('sajuUserData');
    const storedSaju = sessionStorage.getItem('sajuContext');
    
    let name = '사용자';
    let userContext = {};
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        name = parsedUser.name || name;
        userContext = parsedUser;
      } catch (e) {}
    }
    
    let sajuInfo = {};
    if (storedSaju) {
      try {
        sajuInfo = JSON.parse(storedSaju);
      } catch (e) {}
    }

    setContext({ user: userContext, saju: sajuInfo });

    setMessages([
      {
        role: 'ai',
        content: `안녕하세요 ${name}님, 사주 풀이 결과를 바탕으로 더 궁금한 점이 있으신가요? 이직 시기, 궁합, 혹은 오늘의 운세에 대해 구체적으로 물어보셔도 좋습니다.`
      }
    ]);
  }, []);

  // 스크롤 하단 고정
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: context || {}
        })
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} color="var(--foreground)" />
        </button>
        <div className={styles.title}>
          <Bot size={20} color="var(--primary)" /> AI 사주가와 대화
        </div>
        <div style={{ width: '24px' }}></div>
      </header>

      <div className={styles.chatWindow} ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className={styles.typing}>AI 사주가가 고민하고 있습니다...</div>}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="고민을 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            className={styles.sendButton} 
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
