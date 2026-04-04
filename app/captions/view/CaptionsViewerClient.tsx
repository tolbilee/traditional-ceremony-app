'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CAPTION_LANGUAGE_OPTIONS } from '../languageOptions';

const VIEW_LANGUAGE_LABELS: Record<string, string> = {
  arabic: 'العربية',
  bulgarian: 'Български',
  chinese: '简体中文',
  chinese_traditional: '繁體中文',
  dutch: 'Nederlands',
  english: 'English',
  filipino: 'Filipino',
  french: 'Français',
  german: 'Deutsch',
  greek: 'Ελληνικά',
  hindi: 'हिन्दी',
  japanese: '日本語',
  kazakh: 'Қазақ тілі',
  korean: '한국어',
  lao: 'ລາວ',
  persian: 'فارسی',
  romanian: 'Română',
  russian: 'Русский',
  spanish: 'Español',
  thai: 'ไทย',
  vietnamese: 'Tiếng Việt',
};

const VIEW_SUBTITLE_FONT_FAMILY: Record<string, string> = {
  chinese: '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Heiti SC", "SimHei", sans-serif',
  chinese_traditional: '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Source Han Sans TC", "Heiti TC", sans-serif',
  japanese: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
  korean: '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
};

type CaptionRoom = {
  id: string;
  room_code: string;
  title: string;
  status: 'active' | 'closed';
};

type CaptionState = {
  room_id: string;
  current_index: number;
  current_language: string;
  current_speaker?: string;
  current_korean: string;
  current_english: string;
  current_texts?: Record<string, string>;
  updated_at: string;
};

export default function CaptionsViewerClient({ initialRoomCode }: { initialRoomCode: string }) {
  const roomCode = initialRoomCode.trim().toLowerCase();
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState(roomCode);

  const [room, setRoom] = useState<CaptionRoom | null>(null);
  const [state, setState] = useState<CaptionState | null>(null);
  const [prestartTexts, setPrestartTexts] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<string>('korean');
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomCode) {
      setError('');
      setStatus('idle');
      return;
    }

    let mounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function pullLatestState() {
      try {
        const res = await fetch(`/api/captions/rooms?roomCode=${encodeURIComponent(roomCode)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok || !mounted) return;
        if (data?.state) {
          setState(data.state as CaptionState);
        }
        if (data?.prestartTexts && typeof data.prestartTexts === 'object') {
          setPrestartTexts(data.prestartTexts as Record<string, string>);
        }
      } catch {
        // Polling is a fallback; ignore transient pull errors.
      }
    }

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
        setPrestartTexts((data?.prestartTexts || {}) as Record<string, string>);
        setStatus('connected');
        pollTimer = setInterval(() => {
          void pullLatestState();
        }, 400);

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
      if (pollTimer) clearInterval(pollTimer);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomCode]);

  const subtitle = useMemo(() => {
    if (!state) return '';
    if (state.current_index < 0) {
      return (
        prestartTexts[language] ||
        prestartTexts.korean ||
        '지금은 전통혼례 시작 전입니다.'
      );
    }
    const map = (state.current_texts || {}) as Record<string, string>;
    return map[language] || map.korean || state.current_korean || '';
  }, [state, language, prestartTexts]);

  const speaker = useMemo(() => {
    const raw = (state?.current_speaker || '').trim();
    if (!raw) return '';

    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const byLang: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsed || {})) {
          if (typeof value !== 'string') continue;
          byLang[key.trim().toLowerCase()] = value.trim();
        }
        return byLang[language] || byLang.korean || Object.values(byLang)[0] || '';
      } catch {
        return raw;
      }
    }

    return raw;
  }, [state, language]);

  const viewerLanguageOptions = useMemo(
    () =>
      CAPTION_LANGUAGE_OPTIONS.map((lang) => ({
        ...lang,
        viewLabel: VIEW_LANGUAGE_LABELS[lang.code] || lang.code,
      })),
    []
  );

  const subtitleFontFamily = useMemo(
    () => VIEW_SUBTITLE_FONT_FAMILY[language] || VIEW_SUBTITLE_FONT_FAMILY.korean,
    [language]
  );

  function enterRoom() {
    const nextCode = roomCodeInput.trim().toLowerCase();
    if (!nextCode) return;
    router.push(`/captions/view?roomCode=${encodeURIComponent(nextCode)}`);
  }

  if (!roomCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-md rounded-xl border border-white/20 bg-white/5 p-6">
          <h1 className="mb-3 text-xl font-bold">실시간 자막 접속</h1>
          <p className="mb-4 text-sm text-white/80">룸 코드를 입력해 자막 화면에 연결하세요.</p>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border border-white/30 bg-black/30 px-3 py-2 text-white placeholder:text-white/50"
              placeholder="예: koreahouse"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') enterRoom();
              }}
            />
            <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" onClick={enterRoom}>
              접속
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/20 px-4 py-3">
        <div className="text-sm text-white/80">{room?.title || '실시간 자막'}</div>
        <div className="text-xs text-white/70">
          {status === 'connected' ? '실시간 연결됨' : status === 'loading' ? '연결 중' : '오류'}
        </div>
      </header>

      <section className="flex items-center justify-center gap-2 px-4 py-3">
        <label className="text-sm text-white/80">Language</label>
        <select
          className="rounded border border-white/30 bg-black/40 px-3 py-1 text-sm text-white"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {viewerLanguageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.viewLabel}
            </option>
          ))}
        </select>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 pb-10">
        {status === 'error' ? (
          <div className="max-w-xl rounded-lg border border-red-400/40 bg-red-900/20 p-4 text-sm text-red-100">
            연결 오류: {error || '알 수 없는 오류'}
          </div>
        ) : (
          <div className="max-w-5xl text-center">
            <div className="mb-4 text-lg font-semibold text-yellow-200 md:text-2xl">
              {speaker || '-'}
            </div>
            <div
              className="whitespace-pre-wrap text-3xl font-semibold leading-relaxed md:text-5xl"
              style={{ fontFamily: subtitleFontFamily }}
            >
              {subtitle || '자막을 기다리는 중입니다...'}
            </div>
          </div>
        )}
      </section>

      <footer className="px-4 pb-4 text-center text-xs text-white/60">
        {roomCode ? `룸 코드: ${roomCode}` : '룸 코드가 없습니다.'}
      </footer>
    </main>
  );
}
