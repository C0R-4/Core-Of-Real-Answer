import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('saju_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch result error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Fetch result catch error:', error);
    return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
  }
}
