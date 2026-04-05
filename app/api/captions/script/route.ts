import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRoomCode, toOptionalText } from '../_utils';

type ScriptCueInput = {
  speaker?: unknown;
  speakers?: unknown;
  texts?: unknown;
};

function parseReadonlyRoomCodes(): Set<string> {
  const raw = process.env.CAPTIONS_SCRIPT_READONLY_ROOMS || '';
  return new Set(
    raw
      .split(',')
      .map((value) => normalizeRoomCode(value))
      .filter(Boolean)
  );
}

function isScriptWriteLocked(roomCode: string): boolean {
  const isGlobalReadonly = (process.env.CAPTIONS_SCRIPT_READONLY || '').toLowerCase() === 'true';
  if (isGlobalReadonly) return true;
  const roomLocks = parseReadonlyRoomCodes();
  return roomLocks.has(roomCode);
}

const PAGE_SIZE = 1000;

async function fetchAllCaptionMessages(supabase: any, roomId: string) {
  const allRows: any[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await (supabase as any)
      .from('caption_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('seq', { ascending: true })
      .order('lang', { ascending: true })
      .range(from, to);

    if (error) return { data: null, error };
    const rows = data || [];
    allRows.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allRows, error: null };
}

async function fetchAllSeqRows(supabase: any, roomId: string) {
  const allRows: Array<{ seq: number }> = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await (supabase as any)
      .from('caption_messages')
      .select('seq')
      .eq('room_id', roomId)
      .gt('seq', 0)
      .order('seq', { ascending: true })
      .range(from, to);

    if (error) return { data: null, error };
    const rows = (data || []) as Array<{ seq: number }>;
    allRows.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allRows, error: null };
}

async function isDbGuardLocked(supabase: any, roomId: string) {
  const { data, error } = await (supabase as any).from('caption_script_guard').select('locked').eq('room_id', roomId).maybeSingle();
  if (error) {
    const message = String(error?.message || '');
    const code = String(error?.code || '');
    if (code === '42P01' || message.includes('caption_script_guard') || message.includes('relation')) {
      return false;
    }
    console.error('Failed to read caption_script_guard lock:', error);
    return false;
  }
  return Boolean(data?.locked);
}

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
      fetchAllCaptionMessages(supabase as any, room.id),
    ]);

    if (stateError) {
      console.error('Failed to load caption state for script:', stateError);
      return NextResponse.json({ error: '현재 상태 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (messagesError) {
      console.error('Failed to load caption messages for script:', messagesError);
      return NextResponse.json({ error: '자막 스크립트 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const dbGuardLocked = await isDbGuardLocked(supabase as any, room.id);
    return NextResponse.json({
      room,
      state: state || null,
      messages: messages || [],
      count: (messages || []).length,
      scriptWriteLocked: isScriptWriteLocked(roomCode) || dbGuardLocked,
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
    const allowMajorShrink = body.allowMajorShrink === true;

    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { room, error: roomErr } = await getActiveRoom(supabase as any, roomCode);
    if (roomErr) {
      return NextResponse.json({ error: roomErr }, { status: 404 });
    }

    const dbGuardLocked = await isDbGuardLocked(supabase as any, room.id);
    if (isScriptWriteLocked(roomCode) || dbGuardLocked) {
      return NextResponse.json(
        {
          error: '자막 편집 보호 모드가 활성화되어 있어 스크립트 저장이 차단되었습니다.',
          code: 'SCRIPT_WRITE_LOCKED',
          roomCode,
        },
        { status: 423 }
      );
    }

    const { data: existingSeqRows, error: existingSeqError } = await fetchAllSeqRows(supabase as any, room.id);

    if (existingSeqError) {
      console.error('Failed to read existing script size:', existingSeqError);
      return NextResponse.json({ error: '기존 자막 개수 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const existingCueCount = new Set<number>((existingSeqRows || []).map((r: any) => Number(r.seq)).filter((v: number) => Number.isFinite(v) && v > 0)).size;
    const incomingCueCount = cues.length;

    // Safety valve:
    // Block suspicious large shrink (e.g. 64 -> 49) unless explicitly allowed.
    const shrinkDelta = existingCueCount - incomingCueCount;
    if (shrinkDelta >= 5 && !allowMajorShrink) {
      return NextResponse.json(
        {
          error: `안전 차단: 자막 개수가 크게 줄어드는 저장 요청(${existingCueCount} -> ${incomingCueCount})이 감지되었습니다. 새로고침 후 다시 시도하거나 의도된 전체 정리 작업에서만 허용하세요.`,
          existingCueCount,
          incomingCueCount,
        },
        { status: 409 }
      );
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
      .eq('room_id', room.id)
      .gt('seq', 0);

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
