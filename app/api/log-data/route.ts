import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { error } = await supabase
      .from('saju_logs')
      .insert([
        {
          name: data.name,
          gender: data.gender,
          birth_date: data.birthDate,
          birth_time: data.birthTime || null,
          is_lunar: data.isLunar,
          year: data.year,
          month: data.month,
          day: data.day
        }
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logging API error:', error);
    return NextResponse.json({ error: 'Failed to log data' }, { status: 500 });
  }
}
