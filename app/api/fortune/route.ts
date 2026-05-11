import { NextRequest, NextResponse } from 'next/server';
import { calculateFourPillars, fourPillarsToString } from 'manseryeok';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birthDate, birthTime = '00:00', gender, isLunar, chapter = 0 } = body;
    
    const isLunarBoolean = isLunar === 'true' || isLunar === true;

    if (!birthDate) {
      return NextResponse.json({ error: 'Missing birthDate' }, { status: 400 });
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    const hasTime = body.birthTime && body.birthTime.trim() !== '';
    
    let hour = 0;
    let minute = 0;
    if (hasTime) {
      const parts = body.birthTime.split(':');
      hour = parseInt(parts[0], 10) || 0;
      minute = parseInt(parts[1], 10) || 0;
    }

    // 1. 양력 날짜 확정 (절기 계산용)
    let solarYear = year;
    let solarMonth = month;
    let solarDay = day;

    if (isLunarBoolean) {
      const { lunarToSolar } = require('manseryeok');
      const solar = lunarToSolar(year, month, day, body.isLeapMonth === 'true' || body.isLeapMonth === true);
      solarYear = solar.year;
      solarMonth = solar.month;
      solarDay = solar.day;
    }

    // 2. 사주 연도 및 월주 계산을 위한 절기 판정
    // 고정 데이터
    const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const EARTHLY_BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const SOLAR_TERM_BASE = [
      5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37, 7.108, 22.83,
      7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94,
    ];

    const getCorrectedSolarTermDate = (y: number, termIdx: number) => {
      const base = SOLAR_TERM_BASE[termIdx];
      const diff = y - 2000;
      const d = Math.floor(base + 0.2422 * diff - Math.floor(diff / 4));
      return new Date(y, Math.floor(termIdx / 2), d);
    };

    const targetDate = new Date(solarYear, solarMonth - 1, solarDay, hour, minute);

    // 입춘(立春) 기준 연주 보정
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
    // 현재 날짜 이전에 가장 최근에 온 절기(Jeolgi, 짝수 인덱스) 찾기
    let latestTermIdx = -1;
    // 작년 12월 절기(Daeseol, 22)부터 확인
    const lastYearDaeseol = getCorrectedSolarTermDate(solarYear - 1, 22);
    const lastYearSohan = getCorrectedSolarTermDate(solarYear, 0); // 올해 1월 소한은 작년 축월의 시작

    if (targetDate >= lastYearDaeseol) latestTermIdx = 22;
    
    // 올해의 절기들 확인 (0, 2, 4, ..., 22)
    for (let i = 0; i <= 22; i += 2) {
      const termDate = getCorrectedSolarTermDate(solarYear, i);
      if (targetDate >= termDate) {
        latestTermIdx = i;
      } else {
        break;
      }
    }

    // 절기 인덱스에 따른 월지(Wolji) 매핑
    // 2(입춘)->1(인), 4(경칩)->2(묘), ..., 22(대설)->11(자), 0(소한)->12(축)
    const solarTermMonth = ((Math.floor(latestTermIdx / 2) + 11) % 12) + 1;
    
    // 월간(Month Stem) 계산: (연간%5 * 2 + 월지 + 1) % 10
    const yearStemMod5 = yStemIdx % 5;
    const mStemIdx = (yearStemMod5 * 2 + solarTermMonth + 1) % 10;
    
    const finalMonth = HEAVENLY_STEMS[mStemIdx] + EARTHLY_BRANCHES[(solarTermMonth + 1) % 12]; // 자(0), 축(1), 인(2)...
    // EARTHLY_BRANCHES index: 자(0), 축(1), 인(2)... 
    // solarTermMonth: 인(1)->index 2, 묘(2)->index 3, ..., 자(11)->index 0, 축(12)->index 1
    const mBranchIdx = (solarTermMonth + 1) % 12;
    const finalMonthString = HEAVENLY_STEMS[mStemIdx] + EARTHLY_BRANCHES[mBranchIdx];
    const finalMonthHanja = HEAVENLY_STEMS_HANJA[mStemIdx] + EARTHLY_BRANCHES_HANJA[mBranchIdx];

    const sajuObject = {
      year: finalYear,
      month: finalMonthString,
      day: pillars.day,
      hour: hasTime ? pillars.hour : '--',
    };

    const sajuString = `${sajuObject.year}연주, ${sajuObject.month}월주, ${sajuObject.day}일주, ${sajuObject.hour}시주`;
    const hanjaString = `${finalYearHanja}年柱, ${finalMonthHanja}月柱, ${hanjas.day.hanja}日柱, ${hasTime ? hanjas.hour.hanja : '--'}時柱`;

    // Gemini AI 호출
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const chapterPrompts: { [key: number]: string } = {
      0: `사주란 무엇인가요? 에 대해 친절하게 설명해줘. (프롤로그)`,
      1: `나의 사주팔자 분석: 사주원국(${sajuString})에 대한 상세 설명과 대운/오행 분석을 해줘.`,
      2: `일주와 오행 분석: 나는 어떤 사람인지, 생활 양식, 행동 성향, 타고난 기질과 성품, 내면 성향을 아주 자세히 설명해줘.`,
      3: `십성 분석: 나의 십성, 사회적 관계, 가족관계(육친), 나의 매력 포인트, 시기별(초년, 청년, 중년, 말년) 십성 분석을 해줘.`,
      4: `십이운성 분석: 종합 십이운성 분석 및 시기별(초년, 청년, 중년, 말년) 분석을 해줘.`,
      5: `신살 분석: 종합 신살 분석 및 시기별(초년, 청년, 중년, 말년) 분석을 해줘.`,
      6: `귀인 분석: 종합 귀인 분석 및 시기별(초년, 청년, 중년, 말년) 분석을 해줘.`,
      7: `재물운: 재물운 총운, 시기별 분석, 내 재물운 특징, 소비 습관, 재물운을 높여줄 행운의 아이템을 추천해줘.`,
      8: `연애&결혼운: 이성이 느끼는 나의 매력, 연애 성향, 피해야 할 사람, 애정운 향상 조언, 결혼/비혼 운세를 분석해줘.`,
      9: `직업운: 나의 재능, 재능 극대화 방법, 잘 맞는 직장, 커리어 조력자, 직장에서 피해야 할 사람을 알려줘.`,
      10: `건강운: 타고난 체질과 건강 상태, 주의할 신체 부위, 잘 맞는 운동, 조심할 운동, 좋은 식습관을 추천해줘.`,
      11: `대운: 전체적인 시기별 대운 풀이를 상세히 해줘.`,
      12: `향후 5년간의 연운과 삼재: 올해의 운세 및 내년~5년 후의 흐름을 분석해줘.`
    };

    const prompt = `
      너는 전문 사주풀이 전문가야. 
      말투는 신뢰감이 가면서도 따뜻한 전문가의 말투를 사용해줘.
      현재 기준 연도는 2026년입니다. 2026년을 기준으로 운세를 풀이해줘.

      [사용자 정보]
      이름: ${name}, 성별: ${gender === 'male' ? '남성' : '여성'}, 생년월일: ${birthDate} (${isLunarBoolean ? '음력' : '양력'}), 태어난 시간: ${hasTime ? birthTime : '모름'}
      사주(팔자): ${sajuString}
      연주: ${sajuObject.year}, 월주: ${sajuObject.month}, 일주: ${sajuObject.day}, 시주: ${sajuObject.hour}

      [분석 요청: ${chapter}장]
      ${chapterPrompts[chapter] || '사주 전반에 대해 분석해줘.'}

      [주의사항]
      1. 인삿말, 자기소개 등 사족은 절대 하지 마.
      2. 곧바로 본론으로 들어가서 아주 상세하게 마크다운(Markdown) 형식으로 작성해줘.
    `;

    const aiResult = await model.generateContent(prompt);
    const text = aiResult.response.text();

    return NextResponse.json({
      saju: {
        string: sajuString,
        object: sajuObject,
        hanja: hanjaString,
      },
      content: text,
      chapter
    });

  } catch (error: any) {
    console.error('Fortune API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to calculate fortune' }, { status: 500 });
  }
}
