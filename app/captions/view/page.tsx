'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function CaptionsViewerPage() {
  const searchParams = useSearchParams();
  const roomCode = (searchParams.get('roomCode') || '').trim().toLowerCase();

  const [room, setRoom] = useState<CaptionRoom | null>(null);
  const [state, setState] = useState<CaptionState | null>(null);
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomCode) {
      setError('Missing roomCode query parameter.');
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
          throw new Error(data?.error || 'Failed to load room.');
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
        <div className="text-sm text-white/80">{room?.title || 'Live Captions'}</div>
        <div className="text-xs text-white/70">
          {status === 'connected' ? 'LIVE' : status === 'loading' ? 'CONNECTING' : 'ERROR'}
        </div>
      </header>

      <section className="flex justify-center gap-2 px-4 py-3">
        <button
          onClick={() => setLanguage('korean')}
          className={`rounded px-3 py-1 text-sm ${language === 'korean' ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
        >
          Korean
        </button>
        <button
          onClick={() => setLanguage('english')}
          className={`rounded px-3 py-1 text-sm ${language === 'english' ? 'bg-white text-black' : 'bg-white/20 text-white'}`}
        >
          English
        </button>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 pb-10">
        {status === 'error' ? (
          <div className="max-w-xl rounded-lg border border-red-400/40 bg-red-900/20 p-4 text-sm text-red-100">
            Connection error: {error || 'Unknown error'}
          </div>
        ) : (
          <div className="max-w-5xl whitespace-pre-wrap text-center text-3xl font-semibold leading-relaxed md:text-5xl">
            {subtitle || fallbackSubtitle || 'Waiting for captions...'}
          </div>
        )}
      </section>

      <footer className="px-4 pb-4 text-center text-xs text-white/60">
        {roomCode ? `room: ${roomCode}` : 'room code missing'}
      </footer>
    </main>
  );
}
