import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode } from '../_utils';

function sanitizeTexts(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lang = typeof key === 'string' ? key.trim().toLowerCase() : '';
    if (!lang) continue;
    out[lang] = typeof value === 'string' ? value.trim() : '';
  }
  return out;
}

async function getActiveRoom(supabase: any, roomCode: string) {
  const { data: room, error } = await (supabase as any)
    .from('caption_rooms')
    .select('*')
    .eq('room_code', roomCode)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch active room for prestart:', error);
    return { room: null, error: '룸 조회 중 오류가 발생했습니다.' };
  }
  if (!room) {
    return { room: null, error: '활성 룸을 찾을 수 없습니다.' };
  }
  return { room, error: null };
}

export async function GET(request: NextRequest) {
  try {
    const roomCode = normalizeRoomCode(request.nextUrl.searchParams.get('roomCode') || '');
    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { room, error: roomError } = await getActiveRoom(supabase, roomCode);
    if (roomError || !room) {
      return NextResponse.json({ error: roomError || '활성 룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: rows, error: rowsError } = await (supabase as any)
      .from('caption_messages')
      .select('lang,content')
      .eq('room_id', room.id)
      .eq('seq', 0);

    if (rowsError) {
      console.error('Failed to load prestart messages:', rowsError);
      return NextResponse.json({ error: '시작 전 문구 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const texts: Record<string, string> = {};
    for (const row of rows || []) {
      if (!row?.lang) continue;
      texts[String(row.lang)] = String(row.content || '');
    }

    return NextResponse.json({ roomCode, texts });
  } catch (error) {
    console.error('GET /api/captions/prestart error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomCode = normalizeRoomCode(body.roomCode);
    const texts = sanitizeTexts(body.texts);

    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { room, error: roomError } = await getActiveRoom(supabase, roomCode);
    if (roomError || !room) {
      return NextResponse.json({ error: roomError || '활성 룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { error: deleteError } = await (supabase as any)
      .from('caption_messages')
      .delete()
      .eq('room_id', room.id)
      .eq('seq', 0);

    if (deleteError) {
      console.error('Failed to clear prestart messages:', deleteError);
      return NextResponse.json({ error: '기존 시작 전 문구 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const rows = Object.entries(texts)
      .filter(([, content]) => content.trim().length > 0)
      .map(([lang, content]) => ({
        room_id: room.id,
        seq: 0,
        lang,
        content,
        speaker: '',
      }));

    if (rows.length > 0) {
      const { error: insertError } = await (supabase as any).from('caption_messages').insert(rows);
      if (insertError) {
        console.error('Failed to save prestart messages:', insertError);
        return NextResponse.json({ error: '시작 전 문구 저장 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, roomCode, savedLanguages: rows.length });
  } catch (error) {
    console.error('PUT /api/captions/prestart error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
