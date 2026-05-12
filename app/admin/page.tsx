'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, LogOut, Users, Calendar, Clock, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saju_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Simple way to logout: clear auth token cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: '#2d3436',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      padding: '2rem'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '1rem 2rem',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={24} color="#7c6cae" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>관리자 대시보드</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchLogs} style={{
            background: '#fff',
            border: '1px solid #ddd',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={18} /> 새로고침
          </button>
          <button onClick={handleLogout} style={{
            background: '#ff7675',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <LogOut size={18} /> 로그아웃
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          background: '#ff7675',
          color: 'white',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f2f6' }}>
              <th style={{ padding: '1rem' }}>날짜</th>
              <th style={{ padding: '1rem' }}>이름</th>
              <th style={{ padding: '1rem' }}>성별</th>
              <th style={{ padding: '1rem' }}>생년월일</th>
              <th style={{ padding: '1rem' }}>태어난 시간</th>
              <th style={{ padding: '1rem' }}>구분</th>
              <th style={{ padding: '1rem' }}>결과 보기</th>
              <th style={{ padding: '1rem' }}>채팅 내역</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center' }}>데이터를 불러오는 중...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center' }}>데이터가 없습니다.</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f2f6', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#636e72' }}>
                  {new Date(log.created_at).toLocaleString('ko-KR')}
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{log.name}</td>
                <td style={{ padding: '1rem' }}>{log.gender === 'male' ? '남성' : '여성'}</td>
                <td style={{ padding: '1rem' }}>{log.birth_date}</td>
                <td style={{ padding: '1rem' }}>{log.birth_time || '모름'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background: log.is_lunar ? '#ffeaa7' : '#fab1a0',
                    color: '#2d3436'
                  }}>
                    {log.is_lunar ? '음력' : '양력'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <a href={`/result?id=${log.id}`} target="_blank" rel="noreferrer" style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: '#74b9ff',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}>
                    결과
                  </a>
                </td>
                <td style={{ padding: '1rem' }}>
                  <a href={`/chat?id=${log.id}`} target="_blank" rel="noreferrer" style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: '#a29bfe',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}>
                    채팅
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
