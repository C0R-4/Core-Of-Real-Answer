import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, result_data, saju_context } = await request.json();

    if (!id || !result_data) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saju_logs')
      .update({ 
        result_data,
        saju_context
      })
      .eq('id', id);

    if (error) {
      console.error('Save result error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save result catch error:', error);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
