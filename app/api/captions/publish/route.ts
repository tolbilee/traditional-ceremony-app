import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isCaptionLanguage, normalizeRoomCode, toOptionalText } from '../_utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roomCode = normalizeRoomCode(body.roomCode);
    const currentLanguage = toOptionalText(body.currentLanguage);
    const currentIndex = Number(body.currentIndex);
    const currentKorean = toOptionalText(body.currentKorean);
    const currentEnglish = toOptionalText(body.currentEnglish);
    const performanceTitle = toOptionalText(body.performanceTitle).trim();
    const appendMessages = body.appendMessages !== false;

    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode가 필요합니다.' }, { status: 400 });
    }
    if (!Number.isInteger(currentIndex) || currentIndex < -1) {
      return NextResponse.json({ error: 'currentIndex가 올바르지 않습니다.' }, { status: 400 });
    }
    if (!isCaptionLanguage(currentLanguage)) {
      return NextResponse.json({ error: 'currentLanguage는 korean 또는 english여야 합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: room, error: roomError } = await (supabase as any)
      .from('caption_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .eq('status', 'active')
      .maybeSingle();

    if (roomError) {
      console.error('Failed to fetch active room:', roomError);
      return NextResponse.json({ error: '룸 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
    if (!room) {
      return NextResponse.json({ error: '활성 룸을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (performanceTitle) {
      const { error: titleError } = await (supabase as any)
        .from('caption_rooms')
        .update({ title: performanceTitle })
        .eq('id', room.id);

      if (titleError) {
        console.error('Failed to update room title:', titleError);
        return NextResponse.json({ error: '공연명 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
      }
    }

    const { data: latestMessage, error: latestError } = await (supabase as any)
      .from('caption_messages')
      .select('seq')
      .eq('room_id', room.id)
      .order('seq', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error('Failed to load latest sequence:', latestError);
      return NextResponse.json({ error: '시퀀스 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const lastSeq = latestMessage?.seq ?? 0;
    const providedSeq = Number(body.seq);
    const nextSeq = Number.isInteger(providedSeq) && providedSeq > 0
      ? providedSeq
      : Math.max(lastSeq + 1, currentIndex + 1);

    const { error: stateError } = await (supabase as any)
      .from('caption_state')
      .upsert(
        {
          room_id: room.id,
          current_index: currentIndex,
          current_language: currentLanguage,
          current_korean: currentKorean,
          current_english: currentEnglish,
        },
        { onConflict: 'room_id' }
      );

    if (stateError) {
      console.error('Failed to upsert caption state:', stateError);
      return NextResponse.json({ error: '상태 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (appendMessages) {
      const rows = [];
      if (currentKorean.trim()) {
        rows.push({
          room_id: room.id,
          seq: nextSeq,
          lang: 'korean',
          content: currentKorean,
        });
      }
      if (currentEnglish.trim()) {
        rows.push({
          room_id: room.id,
          seq: nextSeq,
          lang: 'english',
          content: currentEnglish,
        });
      }

      if (rows.length > 0) {
        const { error: messageError } = await (supabase as any)
          .from('caption_messages')
          .upsert(rows, { onConflict: 'room_id,seq,lang' });

        if (messageError) {
          console.error('Failed to upsert caption messages:', messageError);
          return NextResponse.json({ error: '메시지 저장 중 오류가 발생했습니다.' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      roomCode,
      roomId: room.id,
      seq: nextSeq,
      currentIndex,
      currentLanguage,
      appendMessages,
    });
  } catch (error) {
    console.error('POST /api/captions/publish error:', error);
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

