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

    // 라이브러리 버그 대응: 월주는 month-1, 일주는 month 그대로가 정확
    // 두 번 호출하여 각각 올바른 결과를 합성
    const resultForMonth = calculateFourPillars({
      year, month: month - 1, day, hour, minute, isLunar: isLunarBoolean,
    });
    const resultForDay = calculateFourPillars({
      year, month, day, hour, minute, isLunar: isLunarBoolean,
    });

    // 합성: 연주(동일), 월주(month-1 결과), 일주(month 결과), 시주(month 결과)
    const sajuObject = {
      year: resultForDay.toObject().year,
      month: resultForMonth.toObject().month,
      day: resultForDay.toObject().day,
      hour: resultForDay.toObject().hour,
    };

    if (!hasTime) {
      sajuObject.hour = '--';
    }

    const sajuString = `${sajuObject.year}연주, ${sajuObject.month}월주, ${sajuObject.day}일주, ${sajuObject.hour}시주`;

    // 한자도 합성
    const hanjaForMonth = resultForMonth.toHanjaObject();
    const hanjaForDay = resultForDay.toHanjaObject();
    const hanjaString = `${hanjaForDay.year.hanja}年柱, ${hanjaForMonth.month.hanja}月柱, ${hanjaForDay.day.hanja}日柱, ${hasTime ? hanjaForDay.hour.hanja : '--'}時柱`;

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
