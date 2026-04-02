import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode, toOptionalText } from '../_utils';

function generateRoomCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedRoomCode = normalizeRoomCode(body.roomCode);
    const title = toOptionalText(body.title).trim() || '실시간 자막';
    const roomCode = requestedRoomCode || generateRoomCode(8);

    const supabase = createAdminClient();

    const { data: existing, error: findError } = await (supabase as any)
      .from('caption_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .maybeSingle();

    if (findError) {
      console.error('Failed to query caption room:', findError);
      return NextResponse.json({ error: '룸 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        created: false,
        room: existing,
      });
    }

    const { data: room, error: insertError } = await (supabase as any)
      .from('caption_rooms')
      .insert({
        room_code: roomCode,
        title,
        status: 'active',
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Failed to create caption room:', insertError);
      return NextResponse.json({ error: '룸 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const { error: stateError } = await (supabase as any)
      .from('caption_state')
      .upsert(
        {
          room_id: room.id,
          current_index: -1,
          current_language: 'korean',
          current_korean: '',
          current_english: '',
        },
        { onConflict: 'room_id' }
      );

    if (stateError) {
      console.error('Failed to initialize caption state:', stateError);
      return NextResponse.json({ error: '룸 상태 초기화 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json(
      {
        created: true,
        room,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/captions/rooms error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const roomCode = normalizeRoomCode(request.nextUrl.searchParams.get('roomCode') || '');
    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: room, error: roomError } = await (supabase as any)
      .from('caption_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .maybeSingle();

    if (roomError) {
      console.error('Failed to fetch room:', roomError);
      return NextResponse.json({ error: '룸 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: '룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: state, error: stateError } = await (supabase as any)
      .from('caption_state')
      .select('*')
      .eq('room_id', room.id)
      .maybeSingle();

    if (stateError) {
      console.error('Failed to fetch room state:', stateError);
      return NextResponse.json({ error: '룸 상태 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ room, state });
  } catch (error) {
    console.error('GET /api/captions/rooms error:', error);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

