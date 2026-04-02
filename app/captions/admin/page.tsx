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
  const [title, setTitle] = useState('실시간 자막');
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
        title: title.trim() || '실시간 자막',
      };
      const res = await fetch('/api/captions/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RoomResponse | { error: string };
      if (!res.ok || 'error' in data) {
        setMessage(`오류: ${'error' in data ? data.error : '룸 생성에 실패했습니다.'}`);
        return;
      }
      setRoomCode(data.room.room_code);
      setRoomId(data.room.id);
      setTitle(data.room.title);
      setRoomCodeInput(data.room.room_code);
      setMessage(data.created ? '룸이 생성되었습니다.' : '기존 룸에 연결되었습니다.');
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function publishCurrent() {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
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
        setMessage(`오류: ${data?.error || '송출에 실패했습니다.'}`);
        return;
      }
      setMessage(`송출 완료 (시퀀스: ${data.seq})`);
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
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
    setMessage('게스트 링크를 복사했습니다.');
  }

  async function resetRoom() {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }

    const confirmed = window.confirm(
      '정말 초기화하시겠습니까?\n현재 룸의 실시간 상태와 히스토리가 모두 초기화됩니다.'
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/captions/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          clearHistory: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '초기화에 실패했습니다.'}`);
        return;
      }

      setCurrentIndex(-1);
      setCurrentLanguage('korean');
      setMessage('룸 초기화가 완료되었습니다.');
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">실시간 자막 운영자 페이지</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">룸 설정</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border p-2"
            placeholder="룸 코드 (비우면 자동 생성)"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
          />
          <input
            className="rounded border p-2"
            placeholder="공연 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white" disabled={busy} onClick={ensureRoom}>
            룸 생성/연결
          </button>
        </div>
        {roomCode ? <p className="mt-2 text-sm text-gray-700">활성 룸: `{roomCode}` (id: {roomId})</p> : null}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">자막 원문 입력</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <textarea
            className="min-h-56 rounded border p-3"
            placeholder="한국어 자막을 한 줄씩 입력하세요"
            value={koreanLinesText}
            onChange={(e) => setKoreanLinesText(e.target.value)}
          />
          <textarea
            className="min-h-56 rounded border p-3"
            placeholder="영어 자막을 한 줄씩 입력하세요"
            value={englishLinesText}
            onChange={(e) => setEnglishLinesText(e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">송출 제어</h2>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button className="rounded border px-3 py-2" onClick={() => moveIndex(currentIndex - 1)} disabled={busy || currentIndex <= 0}>
            이전
          </button>
          <button
            className="rounded border px-3 py-2"
            onClick={() => moveIndex(currentIndex + 1)}
            disabled={busy || maxCount === 0 || currentIndex >= maxCount - 1}
          >
            다음
          </button>
          <button className="rounded border px-3 py-2" onClick={() => setCurrentLanguage('korean')}>
            언어: 한국어
          </button>
          <button className="rounded border px-3 py-2" onClick={() => setCurrentLanguage('english')}>
            언어: 영어
          </button>
          <button className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white" disabled={busy} onClick={publishCurrent}>
            현재 자막 송출
          </button>
          <button className="rounded bg-red-600 px-4 py-2 font-semibold text-white" disabled={busy || !roomCode} onClick={resetRoom}>
            룸 초기화
          </button>
        </div>
        <p className="text-sm text-gray-700">
          현재 인덱스: {currentIndex >= 0 ? currentIndex + 1 : 0} / {maxCount}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded border p-3">
            <div className="mb-2 text-xs text-gray-500">현재 한국어</div>
            <div className="min-h-14 whitespace-pre-wrap">{currentKorean || '-'}</div>
          </div>
          <div className="rounded border p-3">
            <div className="mb-2 text-xs text-gray-500">현재 영어</div>
            <div className="min-h-14 whitespace-pre-wrap">{currentEnglish || '-'}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">게스트 링크</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input className="min-w-[260px] flex-1 rounded border p-2" value={guestUrl} readOnly />
          <button className="rounded border px-3 py-2" disabled={!guestUrl} onClick={copyGuestUrl}>
            링크 복사
          </button>
        </div>
      </section>

      {message ? <p className="text-sm font-medium text-blue-700">{message}</p> : null}
    </main>
  );
}
