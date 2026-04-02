'use client';

import { useMemo, useState } from 'react';

type RoomResponse = {
  created: boolean;
  room: {
    id: string;
    room_code: string;
    title: string;
    status: 'active' | 'closed';
  };
};

function normalizeRoomCode(value: string): string {
  return value.trim().toLowerCase();
}

export default function CaptionsAdminPage() {
  const [title, setTitle] = useState('Live Captions');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [koreanLinesText, setKoreanLinesText] = useState('');
  const [englishLinesText, setEnglishLinesText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentLanguage, setCurrentLanguage] = useState<'korean' | 'english'>('korean');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const koreanLines = useMemo(
    () => koreanLinesText.split('\n').map((line) => line.trim()).filter(Boolean),
    [koreanLinesText]
  );
  const englishLines = useMemo(
    () => englishLinesText.split('\n').map((line) => line.trim()).filter(Boolean),
    [englishLinesText]
  );
  const maxCount = Math.max(koreanLines.length, englishLines.length);
  const currentKorean = currentIndex >= 0 ? koreanLines[currentIndex] || '' : '';
  const currentEnglish = currentIndex >= 0 ? englishLines[currentIndex] || '' : '';

  const guestUrl = useMemo(() => {
    if (!roomCode) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/captions/view?roomCode=${roomCode}`;
  }, [roomCode]);

  async function ensureRoom() {
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        roomCode: normalizeRoomCode(roomCodeInput),
        title: title.trim() || 'Live Captions',
      };
      const res = await fetch('/api/captions/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RoomResponse | { error: string };
      if (!res.ok || 'error' in data) {
        setMessage(`Error: ${'error' in data ? data.error : 'Failed to create room'}`);
        return;
      }
      setRoomCode(data.room.room_code);
      setRoomId(data.room.id);
      setTitle(data.room.title);
      setRoomCodeInput(data.room.room_code);
      setMessage(data.created ? 'Room created.' : 'Connected to existing room.');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function publishCurrent() {
    if (!roomCode) {
      setMessage('Create or connect a room first.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/captions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          currentIndex,
          currentLanguage,
          currentKorean,
          currentEnglish,
          performanceTitle: title.trim(),
          appendMessages: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`Error: ${data?.error || 'Publish failed'}`);
        return;
      }
      setMessage(`Published (seq: ${data.seq})`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  function moveIndex(next: number) {
    if (maxCount === 0) return;
    const clamped = Math.max(0, Math.min(next, maxCount - 1));
    setCurrentIndex(clamped);
  }

  async function copyGuestUrl() {
    if (!guestUrl) return;
    await navigator.clipboard.writeText(guestUrl);
    setMessage('Guest link copied.');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Live Captions Admin</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Room Setup</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border p-2"
            placeholder="Room code (optional)"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="Performance title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" disabled={busy} onClick={ensureRoom}>
            Create/Connect Room
          </button>
        </div>
        {roomCode ? <p className="mt-2 text-sm text-gray-700">Active room: `{roomCode}` (id: {roomId})</p> : null}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Caption Source Input</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <textarea
            className="min-h-56 rounded border p-3"
            placeholder="Korean captions, one line per row"
            value={koreanLinesText}
            onChange={(e) => setKoreanLinesText(e.target.value)}
          />
          <textarea
            className="min-h-56 rounded border p-3"
            placeholder="English captions, one line per row"
            value={englishLinesText}
            onChange={(e) => setEnglishLinesText(e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Publish Controls</h2>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button className="rounded border px-3 py-2" onClick={() => moveIndex(currentIndex - 1)} disabled={busy || currentIndex <= 0}>
            Prev
          </button>
          <button
            className="rounded border px-3 py-2"
            onClick={() => moveIndex(currentIndex + 1)}
            disabled={busy || maxCount === 0 || currentIndex >= maxCount - 1}
          >
            Next
          </button>
          <button className="rounded border px-3 py-2" onClick={() => setCurrentLanguage('korean')}>
            Language: Korean
          </button>
          <button className="rounded border px-3 py-2" onClick={() => setCurrentLanguage('english')}>
            Language: English
          </button>
          <button className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white" disabled={busy} onClick={publishCurrent}>
            Publish Current
          </button>
        </div>
        <p className="text-sm text-gray-700">
          Current index: {currentIndex >= 0 ? currentIndex + 1 : 0} / {maxCount}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded border p-3">
            <div className="mb-2 text-xs text-gray-500">Current Korean</div>
            <div className="min-h-14 whitespace-pre-wrap">{currentKorean || '-'}</div>
          </div>
          <div className="rounded border p-3">
            <div className="mb-2 text-xs text-gray-500">Current English</div>
            <div className="min-h-14 whitespace-pre-wrap">{currentEnglish || '-'}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Guest Link</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input className="min-w-[260px] flex-1 rounded border p-2" value={guestUrl} readOnly />
          <button className="rounded border px-3 py-2" disabled={!guestUrl} onClick={copyGuestUrl}>
            Copy Link
          </button>
        </div>
      </section>

      {message ? <p className="text-sm font-medium text-blue-700">{message}</p> : null}
    </main>
  );
}
