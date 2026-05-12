import { calculateFourPillars } from 'manseryeok';

// 고정 데이터
export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const SOLAR_TERM_BASE = [
  5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37, 7.108, 22.83,
  7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94,
];

// 절기 계산 함수 (20세기/21세기 보정)
export const getCorrectedSolarTermDate = (y: number, termIdx: number) => {
  const base = SOLAR_TERM_BASE[termIdx];
  const diff = y - 2000;
  const d = Math.floor(base + 0.2422 * diff - Math.floor(diff / 4));
  return new Date(y, Math.floor(termIdx / 2), d);
};

export interface SajuResult {
  sajuString: string;
  hanjaString: string;
  sajuObject: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  hanjaObject: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

export function getFullSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isLunar: boolean,
  isLeapMonth: boolean = false
): SajuResult {
  // 1. 양력 날짜 확정 (절기 계산용)
  let solarYear = year;
  let solarMonth = month;
  let solarDay = day;

  if (isLunar) {
    const { lunarToSolar } = require('manseryeok');
    const solar = lunarToSolar(year, month, day, isLeapMonth);
    solarYear = solar.year;
    solarMonth = solar.month;
    solarDay = solar.day;
  }

  const targetDate = new Date(solarYear, solarMonth - 1, solarDay, hour, minute);

  // 2. 사주 연도(입춘 기준) 결정
  const lichunDate = getCorrectedSolarTermDate(solarYear, 2);
  let sajuYear = solarYear;
  if (targetDate < lichunDate) {
    sajuYear = solarYear - 1;
  }

  // 3. 사주 계산 (라이브러리 호출 - 일주/시주용)
  const result = calculateFourPillars({
    year: solarYear,
    month: solarMonth,
    day: solarDay,
    hour,
    minute,
    isLunar: false,
  });

  const pillars = result.toObject();
  const hanjas = result.toHanjaObject();

  // 4. 연주(Yeonju) 계산
  const yStemIdx = (((sajuYear - 4) % 10) + 10) % 10;
  const yBranchIdx = (((sajuYear - 4) % 12) + 12) % 12;
  const finalYear = HEAVENLY_STEMS[yStemIdx] + EARTHLY_BRANCHES[yBranchIdx];
  const finalYearHanja = HEAVENLY_STEMS_HANJA[yStemIdx] + EARTHLY_BRANCHES_HANJA[yBranchIdx];

  // 5. 월주(Wolju) 계산
  let latestTermIdx = -1;
  const lastYearDaeseol = getCorrectedSolarTermDate(solarYear - 1, 22);
  
  if (targetDate >= lastYearDaeseol) latestTermIdx = 22;
  
  for (let i = 0; i <= 22; i += 2) {
    const termDate = getCorrectedSolarTermDate(solarYear, i);
    if (targetDate >= termDate) {
      latestTermIdx = i;
    } else {
      break;
    }
  }

  const solarTermMonth = ((Math.floor(latestTermIdx / 2) + 11) % 12) + 1;
  const yearStemMod5 = yStemIdx % 5;
  const mStemIdx = (yearStemMod5 * 2 + solarTermMonth + 1) % 10;
  const mBranchIdx = (solarTermMonth + 1) % 12;
  
  const finalMonth = HEAVENLY_STEMS[mStemIdx] + EARTHLY_BRANCHES[mBranchIdx];
  const finalMonthHanja = HEAVENLY_STEMS_HANJA[mStemIdx] + EARTHLY_BRANCHES_HANJA[mBranchIdx];

  const sajuObject = {
    year: finalYear,
    month: finalMonth,
    day: pillars.day,
    hour: pillars.hour,
  };

  const hanjaObject = {
    year: finalYearHanja,
    month: finalMonthHanja,
    day: hanjas.day.hanja,
    hour: hanjas.hour.hanja,
  };

  const sajuString = `${sajuObject.year}연주, ${sajuObject.month}월주, ${sajuObject.day}일주, ${sajuObject.hour}시주`;
  const hanjaString = `${hanjaObject.year}年柱, ${hanjaObject.month}月柱, ${hanjaObject.day}日柱, ${hanjaObject.hour}時柱`;

  return {
    sajuString,
    hanjaString,
    sajuObject,
    hanjaObject,
  };
}
