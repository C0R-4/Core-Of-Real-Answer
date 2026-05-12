'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { getFullSaju } from '@/lib/saju';

export default function TestPage() {
  const [birthDate, setBirthDate] = useState('1998-01-31');
  const [birthTime, setBirthTime] = useState('00:00');
  const [isLunar, setIsLunar] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    const sajuResult = getFullSaju(year, month, day, hour, minute, isLunar);
    setResult(sajuResult);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>사주 계산기 (테스트용)</h1>
      
      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label>생년월일:</label>
          <input 
            type="date" 
            value={birthDate} 
            onChange={(e) => setBirthDate(e.target.value)} 
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>태어난 시간:</label>
          <input 
            type="time" 
            value={birthTime} 
            onChange={(e) => setBirthTime(e.target.value)} 
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>
            <input 
              type="checkbox" 
              checked={isLunar} 
              onChange={(e) => setIsLunar(e.target.checked)} 
            />
            음력
          </label>
        </div>
        
        <button className={styles.button} onClick={handleCalculate}>계산하기</button>
      </div>

      {result && (
        <div className={styles.result}>
          <div className={styles.grid}>
            <div className={styles.pillar}>
              <div className={styles.label}>연주 (Year)</div>
              <div className={styles.value}>{result.sajuObject.year}</div>
              <div className={styles.hanja}>{result.hanjaObject.year}</div>
            </div>
            <div className={styles.pillar}>
              <div className={styles.label}>월주 (Month)</div>
              <div className={styles.value}>{result.sajuObject.month}</div>
              <div className={styles.hanja}>{result.hanjaObject.month}</div>
            </div>
            <div className={styles.pillar}>
              <div className={styles.label}>일주 (Day)</div>
              <div className={styles.value}>{result.sajuObject.day}</div>
              <div className={styles.hanja}>{result.hanjaObject.day}</div>
            </div>
            <div className={styles.pillar}>
              <div className={styles.label}>시주 (Hour)</div>
              <div className={styles.value}>{result.sajuObject.hour}</div>
              <div className={styles.hanja}>{result.hanjaObject.hour}</div>
            </div>
          </div>
          
          <div className={styles.summary}>
            <p><strong>한글:</strong> {result.sajuString}</p>
            <p><strong>한자:</strong> {result.hanjaString}</p>
          </div>
        </div>
      )}
    </div>
  );
}
