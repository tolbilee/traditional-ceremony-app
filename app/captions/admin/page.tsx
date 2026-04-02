'use client';

import { useMemo, useState } from 'react';
import { CAPTION_LANGUAGE_OPTIONS } from '../languageOptions';

type RoomResponse = {
  created: boolean;
  room: {
    id: string;
    room_code: string;
    title: string;
    status: 'active' | 'closed';
  };
};

type Cue = {
  id: string;
  speaker: string;
  texts: Record<string, string>;
};

type HistoryMessageRow = {
  seq: number;
  lang: string;
  content: string;
  speaker?: string | null;
};

type HistoryStateRow = {
  current_index?: number;
};

const OPERATOR_LANGUAGE_CODE = 'korean';

function normalizeRoomCode(value: string): string {
  return value.trim().toLowerCase();
}

function createCue(speaker: string, langCode: string, lineText: string): Cue {
  const baseTexts: Record<string, string> = {
    [OPERATOR_LANGUAGE_CODE]: lineText,
  };
  if (langCode !== OPERATOR_LANGUAGE_CODE) {
    baseTexts[langCode] = lineText;
  }
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    speaker,
    texts: baseTexts,
  };
}

function buttonClass(color: 'blue' | 'green' | 'red' | 'gray' = 'blue'): string {
  const palette = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-emerald-600 hover:bg-emerald-700',
    red: 'bg-red-600 hover:bg-red-700',
    gray: 'bg-slate-600 hover:bg-slate-700',
  };
  return `rounded px-4 py-2 font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${palette[color]}`;
}

export default function CaptionsAdminPage() {
  const [title, setTitle] = useState('실시간 자막');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');

  const [selectedLanguage, setSelectedLanguage] = useState('korean');
  const [speakerInput, setSpeakerInput] = useState('');
  const [lineInput, setLineInput] = useState('');

  const [cues, setCues] = useState<Cue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const currentCue = currentIndex >= 0 ? cues[currentIndex] : null;

  const guestUrl = useMemo(() => {
    if (!roomCode) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/captions/view?roomCode=${roomCode}`;
  }, [roomCode]);

  const displayLanguages = useMemo(() => CAPTION_LANGUAGE_OPTIONS, []);

  async function loadRoomCues(targetRoomCode: string) {
    try {
      const res = await fetch(`/api/captions/history?roomCode=${encodeURIComponent(targetRoomCode)}&limit=500`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '기존 자막을 불러오지 못했습니다.'}`);
        return;
      }

      const rows = (data.messages || []) as HistoryMessageRow[];
      const grouped = new Map<number, Cue>();

      for (const row of rows) {
        const seq = Number(row.seq);
        if (!Number.isFinite(seq) || seq <= 0) continue;

        const existing = grouped.get(seq);
        if (!existing) {
          grouped.set(seq, {
            id: `loaded-${seq}`,
            speaker: row.speaker || '',
            texts: {
              [row.lang]: row.content || '',
            },
          });
        } else {
          existing.texts[row.lang] = row.content || '';
          if (!existing.speaker && row.speaker) existing.speaker = row.speaker;
        }
      }

      const nextCues = Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, cue]) => cue);

      setCues(nextCues);

      const state = (data.state || null) as HistoryStateRow | null;
      const nextIndex = typeof state?.current_index === 'number' ? state.current_index : -1;
      if (nextCues.length === 0) {
        setCurrentIndex(-1);
      } else {
        const safeIndex = Math.max(0, Math.min(nextIndex, nextCues.length - 1));
        setCurrentIndex(nextIndex >= 0 ? safeIndex : 0);
      }

      if (nextCues.length > 0) {
        setMessage(`기존 자막 ${nextCues.length}개를 불러왔습니다.`);
      } else {
        setMessage('기존 자막이 없습니다. 새로 입력해 주세요.');
      }
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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
      if (data.created) {
        setMessage('룸이 생성되었습니다.');
        setCues([]);
        setCurrentIndex(-1);
      } else {
        setMessage('기존 룸에 연결되었습니다. 저장된 자막을 불러오는 중...');
      }
      await loadRoomCues(data.room.room_code);
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  function addCue() {
    const speaker = speakerInput.trim();
    const line = lineInput.trim();
    if (!line) {
      setMessage('대사를 입력해 주세요.');
      return;
    }

    const nextCue = createCue(speaker, selectedLanguage, line);
    setCues((prev) => [...prev, nextCue]);
    setSpeakerInput('');
    setLineInput('');

    if (currentIndex < 0) setCurrentIndex(0);
    setMessage('큐가 추가되었습니다.');
  }

  function updateCueAt(index: number, updater: (cue: Cue) => Cue) {
    setCues((prev) => prev.map((cue, i) => (i === index ? updater(cue) : cue)));
  }

  function editCue(index: number) {
    const cue = cues[index];
    if (!cue) return;

    const nextSpeaker = window.prompt('수정할 화자를 입력하세요.', cue.speaker ?? '');
    if (nextSpeaker === null) return;

    const currentText = cue.texts[selectedLanguage] || '';
    const nextText = window.prompt('수정할 대사를 입력하세요.', currentText);
    if (nextText === null) return;

    updateCueAt(index, (prev) => {
      const texts = { ...prev.texts, [selectedLanguage]: nextText.trim() };
      // 송출기준 한국어가 비어 있으면 편집 텍스트를 기본값으로 채움
      if (!texts[OPERATOR_LANGUAGE_CODE]) {
        texts[OPERATOR_LANGUAGE_CODE] = nextText.trim();
      }
      return {
        ...prev,
        speaker: nextSpeaker.trim(),
        texts,
      };
    });
    setMessage('큐를 수정했습니다.');
  }

  function insertCueBelow(index: number) {
    const speaker = window.prompt('삽입할 화자를 입력하세요.', '') ?? '';
    const line = window.prompt('삽입할 대사를 입력하세요.', '') ?? '';
    if (!line.trim()) {
      setMessage('삽입이 취소되었거나 대사가 비어 있습니다.');
      return;
    }

    const newCue = createCue(speaker.trim(), selectedLanguage, line.trim());
    setCues((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newCue);
      return copy;
    });

    if (currentIndex > index) setCurrentIndex((prev) => prev + 1);
    setMessage('큐를 중간에 삽입했습니다.');
  }

  function deleteCue(index: number) {
    const ok = window.confirm('정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;

    setCues((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((prev) => {
      if (prev === index) return Math.max(0, Math.min(index, cues.length - 2));
      if (prev > index) return prev - 1;
      return prev;
    });
    setMessage('큐를 삭제했습니다.');
  }

  async function publishCueAt(index: number, appendMessages = true, useBusy = true) {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }
    const cue = cues[index];
    if (!cue || index < 0) {
      setMessage('송출할 큐가 없습니다.');
      return;
    }

    if (useBusy) setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/captions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          currentIndex: index,
          currentLanguage: OPERATOR_LANGUAGE_CODE,
          currentSpeaker: cue.speaker,
          currentTexts: cue.texts,
          performanceTitle: title.trim(),
          appendMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '송출에 실패했습니다.'}`);
        return;
      }
      setCurrentIndex(index);
      if (appendMessages) {
        setMessage(`송출 완료 (시퀀스: ${data.seq ?? '-'})`);
      } else {
        setMessage(`큐 #${index + 1} 송출 완료`);
      }
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (useBusy) setBusy(false);
    }
  }

  function moveIndex(next: number) {
    if (cues.length === 0) return;
    const clamped = Math.max(0, Math.min(next, cues.length - 1));
    setCurrentIndex(clamped);
    void publishCueAt(clamped, false, false);
  }

  async function publishCurrent() {
    if (currentIndex < 0) {
      setMessage('현재 선택된 큐가 없습니다.');
      return;
    }
    await publishCueAt(currentIndex);
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
        body: JSON.stringify({ roomCode, clearHistory: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '초기화에 실패했습니다.'}`);
        return;
      }

      setCues([]);
      setCurrentIndex(-1);
      setSpeakerInput('');
      setLineInput('');
      setSelectedLanguage('korean');
      setMessage('룸 초기화가 완료되었습니다.');
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function copyGuestUrl() {
    if (!guestUrl) return;
    await navigator.clipboard.writeText(guestUrl);
    setMessage('게스트 링크를 복사했습니다.');
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">실시간 자막 운영자 페이지</h1>
        {message ? <p className="text-sm font-medium text-blue-700">{message}</p> : null}
      </div>

      <div className="grid h-[calc(100vh-88px)] grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">입력 완료 대사 (송출기준: 한국어)</h2>
          <div className="min-h-0 flex-1 overflow-auto rounded border">
            {cues.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">아직 입력된 큐가 없습니다.</div>
            ) : (
              <ul className="divide-y">
                {cues.map((cue, i) => (
                  <li
                    key={cue.id}
                    className={`p-3 ${currentIndex === i ? 'bg-amber-100' : 'bg-white'} transition`}
                  >
                    <div className="text-xs text-gray-500">큐 #{i + 1}</div>
                    <div className="text-sm font-semibold">화자: {cue.speaker || '-'}</div>
                    <div className="mt-1 whitespace-pre-wrap text-base">{cue.texts.korean || '-'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-xl border bg-white p-4">
          <div className="space-y-4 overflow-auto">
            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">룸 생성 / 연결</h3>
              <div className="grid gap-2 md:grid-cols-3">
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
                <button className={buttonClass('blue')} disabled={busy} onClick={ensureRoom}>
                  룸 생성/연결
                </button>
              </div>
              {roomCode ? <p className="mt-2 text-sm text-gray-700">활성 룸: `{roomCode}` (id: {roomId})</p> : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input className="min-w-[240px] flex-1 rounded border p-2" value={guestUrl} readOnly />
                <button className={buttonClass('gray')} disabled={!guestUrl} onClick={copyGuestUrl}>
                  링크 복사
                </button>
                <button className={buttonClass('red')} disabled={busy || !roomCode} onClick={resetRoom}>
                  룸 초기화
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">자막 입력</h3>
              <div className="grid gap-2 md:grid-cols-3">
                <select
                  className="rounded border p-2"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {displayLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border p-2"
                  placeholder="화자 (speaker)"
                  value={speakerInput}
                  onChange={(e) => setSpeakerInput(e.target.value)}
                />
                <input
                  className="rounded border p-2"
                  placeholder="대사"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCue();
                  }}
                />
              </div>
              <div className="mt-2">
                <button className={buttonClass('green')} disabled={busy} onClick={addCue}>
                  자막 추가
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">입력된 자막 리스트 (선택 언어 기준)</h3>
              <div className="max-h-72 overflow-auto rounded border">
                {cues.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">입력된 큐가 없습니다.</div>
                ) : (
                  <ul className="divide-y">
                    {cues.map((cue, i) => (
                      <li key={`editor-${cue.id}`} className="p-3">
                        <div className="mb-1 text-xs text-gray-500">큐 #{i + 1}</div>
                        <div className="text-sm">화자: {cue.speaker || '-'}</div>
                        <div className="mb-2 whitespace-pre-wrap text-sm text-gray-800">
                          {cue.texts[selectedLanguage] || '-'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className={buttonClass('gray')} onClick={() => editCue(i)}>
                            수정
                          </button>
                          <button className={buttonClass('blue')} onClick={() => insertCueBelow(i)}>
                            삽입
                          </button>
                          <button className={buttonClass('red')} onClick={() => deleteCue(i)}>
                            삭제
                          </button>
                          <button
                            className={buttonClass('green')}
                            onClick={() => setCurrentIndex(i)}
                          >
                            현재 큐로 선택
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">송출 제어</h3>
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  className={buttonClass('gray')}
                  onClick={() => moveIndex(currentIndex - 1)}
                  disabled={busy || currentIndex <= 0}
                >
                  이전
                </button>
                <button
                  className={buttonClass('gray')}
                  onClick={() => moveIndex(currentIndex + 1)}
                  disabled={busy || cues.length === 0 || currentIndex >= cues.length - 1}
                >
                  다음
                </button>
                <button
                  className={buttonClass('green')}
                  onClick={publishCurrent}
                  disabled={busy || !roomCode || !currentCue}
                >
                  현재 자막 송출
                </button>
              </div>
              <p className="text-sm text-gray-700">현재 인덱스: {currentIndex >= 0 ? currentIndex + 1 : 0} / {cues.length}</p>
              <div className="mt-2 rounded border bg-slate-50 p-3">
                <div className="text-xs text-gray-500">송출 미리보기 (한국어)</div>
                <div className="text-sm font-semibold">화자: {currentCue?.speaker || '-'}</div>
                <div className="mt-1 whitespace-pre-wrap text-base">{currentCue?.texts.korean || '-'}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
