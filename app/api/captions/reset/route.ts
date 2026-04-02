import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomCode = normalizeRoomCode(body.roomCode);
    const clearHistory = body.clearHistory !== false;

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
      console.error('Failed to fetch active room for reset:', roomError);
      return NextResponse.json({ error: '룸 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (!room) {
      return NextResponse.json({ error: '활성 룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (clearHistory) {
      const { error: deleteError } = await (supabase as any)
        .from('caption_messages')
        .delete()
        .eq('room_id', room.id);

      if (deleteError) {
        console.error('Failed to delete caption history:', deleteError);
        return NextResponse.json({ error: '히스토리 초기화 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    const { error: stateError } = await (supabase as any)
      .from('caption_state')
      .upsert(
        {
          room_id: room.id,
          current_index: -1,
          current_language: 'korean',
          current_speaker: '',
          current_korean: '',
          current_english: '',
          current_texts: {},
        },
        { onConflict: 'room_id' }
      );

    if (stateError) {
      console.error('Failed to reset caption state:', stateError);
      return NextResponse.json({ error: '상태 초기화 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      roomCode,
      roomId: room.id,
      clearedHistory: clearHistory,
    });
  } catch (error) {
    console.error('POST /api/captions/reset error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
