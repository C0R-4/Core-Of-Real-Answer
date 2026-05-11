import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Logging data to Supabase:', data);
    
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
      console.error('Supabase insert error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully logged data to Supabase');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logging API catch error:', error);
    return NextResponse.json({ error: 'Failed to log data' }, { status: 500 });
  }
}
