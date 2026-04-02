import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode, toSafeLimit } from '../_utils';

export async function GET(request: NextRequest) {
  try {
    const roomCode = normalizeRoomCode(request.nextUrl.searchParams.get('roomCode') || '');
    const limit = toSafeLimit(request.nextUrl.searchParams.get('limit'), 100, 500);

    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: room, error: roomError } = await (supabase as any)
      .from('caption_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .eq('status', 'active')
      .maybeSingle();

    if (roomError) {
      console.error('Failed to fetch active room for history:', roomError);
      return NextResponse.json({ error: '룸 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (!room) {
      return NextResponse.json({ error: '활성 룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    const [{ data: state, error: stateError }, { data: messages, error: messagesError }] = await Promise.all([
      (supabase as any).from('caption_state').select('*').eq('room_id', room.id).maybeSingle(),
      (supabase as any)
        .from('caption_messages')
        .select('*')
        .eq('room_id', room.id)
        .order('seq', { ascending: false })
        .limit(limit),
    ]);

    if (stateError) {
      console.error('Failed to load caption state:', stateError);
      return NextResponse.json({ error: '현재 상태 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (messagesError) {
      console.error('Failed to load caption history:', messagesError);
      return NextResponse.json({ error: '히스토리 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      room,
      state: state || null,
      messages: (messages || []).reverse(),
      count: (messages || []).length,
    });
  } catch (error) {
    console.error('GET /api/captions/history error:', error);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

