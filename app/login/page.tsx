'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #ede7f6 50%, #e8eaf6 75%, #e0f2f1 100%)',
      color: '#2d2b3d',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(242, 208, 224, 0.5) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-80px',
        right: '-80px',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(200, 230, 212, 0.5) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124, 108, 174, 0.1)',
        boxShadow: '0 20px 60px rgba(124, 108, 174, 0.12)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #7c6cae, #5ba8a0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 4px 20px rgba(124, 108, 174, 0.25)'
        }}>
          <Lock size={32} color="white" />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          letterSpacing: '-0.025em',
          background: 'linear-gradient(135deg, #5c4b8a 0%, #7c6cae 50%, #5ba8a0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          사주 미스틱
        </h1>
        <p style={{
          color: '#8a8899',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          사이트 접속을 위해 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(248, 246, 255, 0.8)',
                border: '1px solid rgba(124, 108, 174, 0.15)',
                color: '#2d2b3d',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c6cae';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 108, 174, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(124, 108, 174, 0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <p style={{
              color: '#e57373',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              background: loading ? '#b0a3d0' : 'linear-gradient(135deg, #7c6cae, #5ba8a0)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(124, 108, 174, 0.2)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 108, 174, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 108, 174, 0.2)';
              }
            }}
          >
            {loading ? '확인 중...' : (
              <>
                접속하기 <Sparkles size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
