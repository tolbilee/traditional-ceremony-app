'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type CaptionRoom = {
  id: string;
  room_code: string;
  title: string;
  status: 'active' | 'closed';
};

type CaptionState = {
  room_id: string;
  current_index: number;
  current_language: 'korean' | 'english';
  current_korean: string;
  current_english: string;
  updated_at: string;
};

export default function CaptionsViewerClient({ initialRoomCode }: { initialRoomCode: string }) {
  const roomCode = initialRoomCode.trim().toLowerCase();

  const [room, setRoom] = useState<CaptionRoom | null>(null);
  const [state, setState] = useState<CaptionState | null>(null);
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomCode) {
      setError('roomCode 쿼리 파라미터가 필요합니다.');
      setStatus('error');
      return;
    }

    let mounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function initialize() {
      setStatus('loading');
      setError('');
      try {
        const res = await fetch(`/api/captions/rooms?roomCode=${encodeURIComponent(roomCode)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || '룸 정보를 불러오지 못했습니다.');
        }
        if (!mounted) return;

        setRoom(data.room);
        setState(data.state || null);
        setStatus('connected');

        channel = supabase
          .channel(`caption-state-${data.room.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'caption_state',
              filter: `room_id=eq.${data.room.id}`,
            },
            (payload) => {
              if (!mounted) return;
              const next = (payload.new || null) as CaptionState | null;
              if (next) setState(next);
            }
          )
          .subscribe((evt) => {
            if (!mounted) return;
            if (evt === 'SUBSCRIBED') {
              setStatus('connected');
            }
          });
      } catch (e) {
        if (!mounted) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    initialize();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomCode]);

  const subtitle = useMemo(() => {
    if (!state) return '';
    if (language === 'korean') return state.current_korean || '';
    return state.current_english || '';
  }, [state, language]);

  const fallbackSubtitle = useMemo(() => {
    if (!state) return '';
    return state.current_korean || state.current_english || '';
  }, [state]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/20 px-4 py-3">
        <div className="text-sm text-white/80">{room?.title || '실시간 자막'}</div>
        <div className="text-xs text-white/70">
          {status === 'connected' ? '실시간 연결됨' : status === 'loading' ? '연결 중' : '오류'}
        </div>
      </header>

      <section className="flex justify-center gap-2 px-4 py-3">
        <button
          onClick={() => setLanguage('korean')}
          className={`rounded px-3 py-1 text-sm ${language === 'korean' ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
        >
          한국어
        </button>
        <button
          onClick={() => setLanguage('english')}
          className={`rounded px-3 py-1 text-sm ${language === 'english' ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
        >
          영어
        </button>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 pb-10">
        {status === 'error' ? (
          <div className="max-w-xl rounded-lg border border-red-400/40 bg-red-900/20 p-4 text-sm text-red-100">
            연결 오류: {error || '알 수 없는 오류'}
          </div>
        ) : (
          <div className="max-w-5xl whitespace-pre-wrap text-center text-3xl font-semibold leading-relaxed md:text-5xl">
            {subtitle || fallbackSubtitle || '자막을 기다리는 중입니다...'}
          </div>
        )}
      </section>

      <footer className="px-4 pb-4 text-center text-xs text-white/60">
        {roomCode ? `룸 코드: ${roomCode}` : '룸 코드가 없습니다.'}
      </footer>
    </main>
  );
}
