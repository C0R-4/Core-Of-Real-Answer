'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    birthTime: '',
    gender: 'male',
    isLunar: 'false',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 생년월일 조립 및 패딩
    const paddedMonth = formData.month.padStart(2, '0');
    const paddedDay = formData.day.padStart(2, '0');
    const birthDate = `${formData.year}-${paddedMonth}-${paddedDay}`;

    const submitData = {
      ...formData,
      birthDate,
      isLunar: formData.isLunar === 'true' // API에서 기대하는 불리언 타입으로 변환
    };

    // SessionStorage에 저장 (주소창 노출 방지)
    sessionStorage.setItem('sajuUserData', JSON.stringify(submitData));
    
    // 결과 페이지로 이동
    router.push('/result');
  };

  return (
    <main className={styles.container}>
      <div className={styles.backgroundElement} />
      
      <div className={styles.hero}>
        <div className={styles.ornament}>✦</div>
        <h1 className={`${styles.title} gradient-text`}>
          Core Of Real Answer
        </h1>
        
        <button className={styles.startButton} onClick={() => setIsModalOpen(true)}>
          시작하기
        </button>
      </div>

      {/* 정보 입력 모달 */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>당신의 운명을 열어보세요</h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>이름</label>
                <input
                  type="text"
                  name="name"
                  required
                  className={styles.input}
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>성별</label>
                  <select name="gender" className={styles.select} value={formData.gender} onChange={handleChange}>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>양력/음력</label>
                  <select name="isLunar" className={styles.select} value={formData.isLunar} onChange={handleChange}>
                    <option value="false">양력</option>
                    <option value="true">음력</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>생년월일</label>
                <div className={styles.dateRow}>
                  <select
                    name="year"
                    required
                    className={styles.select}
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">년도</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    name="month"
                    required
                    className={styles.select}
                    value={formData.month}
                    onChange={handleChange}
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                  <select
                    name="day"
                    required
                    className={styles.select}
                    value={formData.day}
                    onChange={handleChange}
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}일</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>태어난 시간 (선택)</label>
                <select
                  name="birthTime"
                  className={styles.select}
                  value={formData.birthTime}
                  onChange={handleChange}
                >
                  <option value="">모름 (미입력)</option>
                  <option value="23:30">자(子)시 : 23시~1시</option>
                  <option value="02:00">축(丑)시 : 1시~3시</option>
                  <option value="04:00">인(寅)시 : 3시~5시</option>
                  <option value="06:00">묘(卯)시 : 5시~7시</option>
                  <option value="08:00">진(辰)시 : 7시~9시</option>
                  <option value="10:00">사(巳)시 : 9시~11시</option>
                  <option value="12:00">오(午)시 : 11시~13시</option>
                  <option value="14:00">미(未)시 : 13시~15시</option>
                  <option value="16:00">신(申)시 : 15시~17시</option>
                  <option value="18:00">유(酉)시 : 17시~19시</option>
                  <option value="20:00">술(戌)시 : 19시~21시</option>
                  <option value="22:00">해(亥)시 : 21시~23시</option>
                </select>
              </div>

              <button type="submit" className={styles.submitButton}>
                결과 보기
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
