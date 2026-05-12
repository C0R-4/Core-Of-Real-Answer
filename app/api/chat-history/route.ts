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
      .select('chat_history')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch chat history error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat_history: data?.chat_history || [] });
  } catch (error) {
    console.error('Fetch chat history catch error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, chat_history } = await request.json();

    if (!id || !chat_history) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saju_logs')
      .update({ chat_history })
      .eq('id', id);

    if (error) {
      console.error('Save chat history error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save chat history catch error:', error);
    return NextResponse.json({ error: 'Failed to save chat history' }, { status: 500 });
  }
}
