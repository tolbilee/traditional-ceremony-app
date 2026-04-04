import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode, toOptionalText } from '../_utils';

type ScriptCueInput = {
  speaker?: unknown;
  speakers?: unknown;
  texts?: unknown;
};

function sanitizeTexts(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lang = typeof key === 'string' ? key.trim().toLowerCase() : '';
    if (!lang) continue;
    out[lang] = typeof value === 'string' ? value : '';
  }
  return out;
}

function sanitizeSpeakers(input: unknown): Record<string, string> {
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
  const { data: room, error } = await supabase.from('caption_rooms').select('*').eq('room_code', roomCode).eq('status', 'active').maybeSingle();
  if (error) {
    console.error('Failed to fetch active room for script:', error);
    return { error: '룸 조회 중 오류가 발생했습니다.', room: null };
  }
  if (!room) {
    return { error: '활성 룸을 찾을 수 없습니다.', room: null };
  }
  return { error: null, room };
}

export async function GET(request: NextRequest) {
  try {
    const roomCode = normalizeRoomCode(request.nextUrl.searchParams.get('roomCode') || '');
    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { room, error: roomErr } = await getActiveRoom(supabase as any, roomCode);
    if (roomErr) {
      return NextResponse.json({ error: roomErr }, { status: 404 });
    }

    const [{ data: state, error: stateError }, { data: messages, error: messagesError }] = await Promise.all([
      (supabase as any).from('caption_state').select('*').eq('room_id', room.id).maybeSingle(),
      (supabase as any).from('caption_messages').select('*').eq('room_id', room.id).order('seq', { ascending: true }),
    ]);

    if (stateError) {
      console.error('Failed to load caption state for script:', stateError);
      return NextResponse.json({ error: '현재 상태 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (messagesError) {
      console.error('Failed to load caption messages for script:', messagesError);
      return NextResponse.json({ error: '자막 스크립트 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      room,
      state: state || null,
      messages: messages || [],
      count: (messages || []).length,
    });
  } catch (error) {
    console.error('GET /api/captions/script error:', error);
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomCode = normalizeRoomCode(body.roomCode);
    const cues = Array.isArray(body.cues) ? (body.cues as ScriptCueInput[]) : [];

    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { room, error: roomErr } = await getActiveRoom(supabase as any, roomCode);
    if (roomErr) {
      return NextResponse.json({ error: roomErr }, { status: 404 });
    }

    const rows: Array<{ room_id: string; seq: number; lang: string; content: string; speaker: string }> = [];
    for (let i = 0; i < cues.length; i += 1) {
      const cue = cues[i];
      const seq = i + 1;
      const speaker = toOptionalText(cue?.speaker).trim();
      const speakers = sanitizeSpeakers(cue?.speakers);
      const texts = sanitizeTexts(cue?.texts);
      for (const [lang, contentRaw] of Object.entries(texts)) {
        const content = (contentRaw || '').trim();
        if (!content) continue;
        rows.push({
          room_id: room.id,
          seq,
          lang,
          content,
          speaker: speakers[lang] || speakers.korean || speaker,
        });
      }
    }

    const { error: deleteError } = await (supabase as any)
      .from('caption_messages')
      .delete()
      .eq('room_id', room.id);

    if (deleteError) {
      console.error('Failed to clear caption script before upsert:', deleteError);
      return NextResponse.json({ error: '기존 자막 정리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (rows.length > 0) {
      const { error: insertError } = await (supabase as any).from('caption_messages').insert(rows);
      if (insertError) {
        console.error('Failed to save caption script rows:', insertError);
        return NextResponse.json({ error: '자막 저장 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    const { data: state } = await (supabase as any).from('caption_state').select('*').eq('room_id', room.id).maybeSingle();
    const currentIndex = typeof state?.current_index === 'number' ? state.current_index : -1;
    const safeIndex = cues.length > 0 ? Math.min(Math.max(currentIndex, -1), cues.length - 1) : -1;

    if (safeIndex !== currentIndex || cues.length === 0) {
      const currentCue = safeIndex >= 0 ? cues[safeIndex] : null;
      const currentTexts = currentCue ? sanitizeTexts(currentCue.texts) : {};
      const currentSpeakers = currentCue ? sanitizeSpeakers(currentCue.speakers) : {};
      const currentSpeaker = currentCue ? toOptionalText(currentCue.speaker).trim() : '';
      const currentSpeakerPayload = JSON.stringify({
        ...currentSpeakers,
        ...(currentSpeaker ? { korean: currentSpeaker } : {}),
      });

      const { error: stateError } = await (supabase as any)
        .from('caption_state')
        .upsert(
          {
            room_id: room.id,
            current_index: safeIndex,
            current_language: 'korean',
            current_speaker: currentSpeakerPayload,
            current_korean: currentTexts.korean || '',
            current_english: currentTexts.english || '',
            current_texts: currentTexts,
          },
          { onConflict: 'room_id' }
        );

      if (stateError) {
        console.error('Failed to normalize caption state during script save:', stateError);
        return NextResponse.json({ error: '상태 보정 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      roomCode,
      roomId: room.id,
      savedCues: cues.length,
      savedRows: rows.length,
    });
  } catch (error) {
    console.error('PUT /api/captions/script error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
