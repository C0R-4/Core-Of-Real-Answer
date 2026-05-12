'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Sparkles, Briefcase, Calendar, MessageCircle, RefreshCw, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CHAPTER_TITLES: { [key: number]: string } = {
  0: '프롤로그',
  1: '나의 사주팔자',
  2: '일주와 오행 분석',
  3: '십성 분석',
  4: '십이운성 분석',
  5: '신살 분석',
  6: '귀인 분석',
  7: '재물운',
  8: '연애 & 결혼운',
  9: '직업운',
  10: '건강운',
  11: '대운',
  12: '향후 5년간의 연운과 삼재'
};

function ResultContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saju, setSaju] = useState<any>(null);
  const [chapters, setChapters] = useState<{ [key: number]: string }>({});
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchAllChapters = async () => {
      try {
        let parsedData: any = null;
        let cachedChapters: any = null;
        let cachedContext: any = null;
        let isFromDb = false;

        if (id) {
          // DB에서 데이터 가져오기
          const dbRes = await fetch(`/api/get-result?id=${id}`);
          const dbJson = await dbRes.json();
          
          if (dbJson.data) {
            const logData = dbJson.data;
            parsedData = {
              name: logData.name,
              gender: logData.gender,
              birthDate: logData.birth_date,
              birthTime: logData.birth_time,
              isLunar: logData.is_lunar,
              year: logData.year,
              month: logData.month,
              day: logData.day
            };
            setUserData(parsedData);

            if (logData.result_data && Object.keys(logData.result_data).length > 0) {
              cachedChapters = logData.result_data;
              cachedContext = logData.saju_context;
              isFromDb = true;
            }
          }
        }

        if (!parsedData) {
          const storedData = sessionStorage.getItem('sajuUserData');
          if (!storedData) {
            router.push('/');
            return;
          }
          parsedData = JSON.parse(storedData);
          setUserData(parsedData);
        }

        if (!isFromDb) {
          const cachedChaptersStr = sessionStorage.getItem('sajuChapters');
          cachedChapters = cachedChaptersStr ? JSON.parse(cachedChaptersStr) : null;
          
          const cachedContextStr = sessionStorage.getItem('sajuContext');
          if (cachedContextStr) {
            cachedContext = JSON.parse(cachedContextStr);
          }
        }

        if (cachedContext) {
          setSaju(cachedContext);
        }

        if (cachedChapters && Object.keys(cachedChapters).length === 13) {
           setChapters(cachedChapters);
           setLoading(false);
           return;
        }

        let currentChapters = cachedChapters || {};
        let currentSajuContext = cachedContext;
        
        if (Object.keys(currentChapters).length > 0) {
           setChapters(currentChapters);
           setLoading(false);
        }

        if (!currentSajuContext || !currentChapters[0]) {
          const initialRes = await fetch('/api/fortune', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...parsedData, chapter: 0 }),
          });
          
          const initialResult = await initialRes.json();
          if (initialResult.error) throw new Error(initialResult.error);
          
          currentSajuContext = initialResult.saju;
          setSaju(currentSajuContext);
          sessionStorage.setItem('sajuContext', JSON.stringify(currentSajuContext));
          
          currentChapters = { ...currentChapters, 0: initialResult.content };
          setChapters(prev => ({ ...prev, 0: initialResult.content }));
          sessionStorage.setItem('sajuChapters', JSON.stringify(currentChapters));
          setLoading(false);
          
          if (id) {
            // 초기 챕터 저장
            await fetch('/api/save-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, result_data: currentChapters, saju_context: currentSajuContext }),
            });
          }
        }

        const remainingChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        for (const ch of remainingChapters) {
          if (!currentChapters[ch]) {
            await fetch('/api/fortune', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...parsedData, chapter: ch }),
            }).then(res => res.json())
              .then(async data => {
                if (data.content) {
                  currentChapters[ch] = data.content;
                  setChapters(prev => ({ ...prev, [ch]: data.content }));
                  sessionStorage.setItem('sajuChapters', JSON.stringify(currentChapters));
                  
                  if (id) {
                    // 점진적으로 DB 업데이트
                    await fetch('/api/save-result', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id, result_data: currentChapters, saju_context: currentSajuContext }),
                    });
                  }
                }
              }).catch(err => console.error(`Error fetching chapter ${ch}:`, err));
          }
        }

      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || '데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchAllChapters();
  }, [router, id]);

  const handleDownload = () => {
    if (!userData || !chapters || Object.keys(chapters).length === 0) {
      alert('분석 결과가 아직 로드되지 않았습니다.');
      return;
    }

    try {
      let reportText = `[사주 미스틱 AI 분석 보고서]\r\n`;
      reportText += `성함: ${userData.name}\r\n`;
      reportText += `생년월일: ${userData.birthDate} (${userData.isLunar ? '음력' : '양력'})\r\n`;
      reportText += `사주팔자: ${saju?.string || ''}\r\n`;
      reportText += `한자구성: ${saju?.hanja || ''}\r\n`;
      reportText += `------------------------------\r\n\r\n`;

      for (let i = 0; i <= 12; i++) {
        const content = chapters[i];
        if (content) {
          reportText += `[${i}장. ${CHAPTER_TITLES[i]}]\r\n`;
          reportText += content + `\r\n\r\n`;
        }
      }

      // UTF-8 BOM 추가 (메모장 등에서 한글 깨짐 방지)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + reportText], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // 파일명을 영문 기반으로 설정 (한글 인코딩 문제 방지)
      const safeName = userData.name || 'saju';
      link.setAttribute('download', `${safeName}_saju_report.txt`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 200);
    } catch (e) {
      console.error('Download failed:', e);
      alert('파일 저장 중 오류가 발생했습니다.');
    }
  };

  if (loading && !saju) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>당신의 운명을 분석하고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loading}>
        <p>{error}</p>
        <button onClick={() => router.push('/')} className={`${styles.btn} ${styles.btnPrimary}`}>
          다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h2 className={`${styles.name} gradient-text`}>{userData?.name}님의 사주 분석 보고서</h2>
        {saju && <p className={styles.hanjaDisplay}>{saju.hanja}</p>}
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>부드러운 안개 너머로 비치는 당신의 운명, 지금 그 고요한 이야기를 시작합니다.</p>
      </header>

      {saju && (
        <div className={styles.sajuGrid}>
          <div className={styles.sajuItem}>
            <span className={styles.sajuLabel}>시주(時柱)</span>
            <span className={styles.sajuValue}>{saju.object.hour}</span>
          </div>
          <div className={styles.sajuItem}>
            <span className={styles.sajuLabel}>일주(日柱)</span>
            <span className={styles.sajuValue}>{saju.object.day}</span>
          </div>
          <div className={styles.sajuItem}>
            <span className={styles.sajuLabel}>월주(月柱)</span>
            <span className={styles.sajuValue}>{saju.object.month}</span>
          </div>
          <div className={styles.sajuItem}>
            <span className={styles.sajuLabel}>연주(年柱)</span>
            <span className={styles.sajuValue}>{saju.object.year}</span>
          </div>
        </div>
      )}

      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
        const content = chapters[num];
        
        return (
          <div key={num} className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <BookOpen size={20} /> {num}장. {CHAPTER_TITLES[num]}
            </h3>
            <div className={styles.card}>
              {content ? (
                <div className={styles.markdownContent}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <div className={styles.chapterLoading}>
                  <div className={styles.miniSpinner}></div>
                  심층 분석 중...
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className={styles.actions}>
        <button onClick={() => router.push('/')} className={`${styles.btn} ${styles.btnSecondary}`}>
          <RefreshCw size={18} style={{ marginRight: '8px' }} /> 다시 보기
        </button>
        <button 
          onClick={handleDownload}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          <BookOpen size={18} style={{ marginRight: '8px' }} /> 결과 저장하기
        </button>
        <button 
          onClick={() => window.print()}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          <Sparkles size={18} style={{ marginRight: '8px' }} /> 인쇄하기
        </button>
        <button 
          onClick={() => router.push(id ? `/chat?id=${id}` : '/chat')} 
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <MessageCircle size={18} style={{ marginRight: '8px' }} /> 더 알아보기 (AI 상담)
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}
