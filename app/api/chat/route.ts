import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    const prompt = `
      당신은 따뜻하고 친절한 사주 상담가이자 조언자입니다. 
      현재 기준 연도는 2026년입니다.
      사용자의 사주 정보와 이전 상담 내용을 바탕으로 질문에 공감하며, 전문적인 사주 용어(예: 십성, 십이운성, 재성, 일지 등)의 복잡한 설명은 최대한 줄이고, 실생활에 적용할 수 있는 구체적이고 실질적인 조언 위주로 대화하듯 편안하게 답변해 주세요.
      기계적이거나 딱딱한 분석 보고서 형식이 아니라, 친한 사람에게 진심 어린 조언을 해주듯 자연스럽고 따뜻한 말투를 사용하세요.
      사용자가 이미 본인의 정보(이름, 생년월일, 성별, 태어난 시간 등)를 제공했으므로, 이를 다시 묻지 말고 제공된 정보를 바탕으로 답변해 주세요.
      인삿말 같은 사족은 빼고 바로 본론으로 들어가되, 따뜻한 어조를 유지하세요.
      
      [사용자 정보 및 사주 데이터]
      ${JSON.stringify(context, null, 2)}

      [대화 내역]
      ${messages.map((m: any) => `${m.role === 'user' ? '질문' : '답변'}: ${m.content}`).join('\n')}
    `;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
