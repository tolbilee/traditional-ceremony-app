'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
  speakers: Record<string, string>;
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
    speakers: {
      [OPERATOR_LANGUAGE_CODE]: speaker,
    },
    texts: baseTexts,
  };
}

function getSpeakerForLanguage(cue: Cue, langCode: string): string {
  const mapped = cue.speakers?.[langCode]?.trim();
  if (mapped) return mapped;
  const korean = cue.speakers?.[OPERATOR_LANGUAGE_CODE]?.trim();
  if (korean) return korean;
  return cue.speaker?.trim() || '';
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

type LeftCueListProps = {
  cues: Cue[];
  selectedIndex: number;
  liveIndex: number;
  displayLanguage: string;
  busy: boolean;
  onSelect: (index: number) => void;
  onPublish: (index: number) => void;
};

const LeftCueList = memo(function LeftCueList({ cues, selectedIndex, liveIndex, displayLanguage, busy, onSelect, onPublish }: LeftCueListProps) {
  if (cues.length === 0) {
    return <div className="p-6 text-sm text-gray-500">아직 입력된 큐가 없습니다.</div>;
  }

  return (
    <ul className="divide-y">
      {cues.map((cue, i) => {
        const isSelected = selectedIndex === i;
        const isLive = liveIndex === i;

        return (
          <li
            key={cue.id}
            id={`cue-left-${i}`}
            onClick={() => onSelect(i)}
            className={`cursor-pointer p-3 transition ${isLive ? 'bg-amber-100' : isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-slate-50`}
          >
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>큐 #{i + 1}</span>
              <span className="flex items-center gap-2">
                {isSelected && !isLive ? (
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-2 py-0.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(i);
                    }}
                  >
                    선택됨
                  </button>
                ) : null}
                {isLive ? <span className="rounded bg-amber-500 px-2 py-0.5 text-white">송출중</span> : null}
              </span>
            </div>
            <div className="text-base font-semibold">화자: {getSpeakerForLanguage(cue, displayLanguage) || '-'}</div>
            <div className="mt-1 whitespace-pre-wrap text-xl leading-8 md:text-2xl">{cue.texts[displayLanguage] || '-'}</div>
          </li>
        );
      })}
    </ul>
  );
});

type RightCueListProps = {
  cues: Cue[];
  selectedLanguage: string;
  onEdit: (index: number) => void;
  onInsert: (index: number) => void;
  onDelete: (index: number) => void;
};

const RightCueList = memo(function RightCueList({ cues, selectedLanguage, onEdit, onInsert, onDelete }: RightCueListProps) {
  if (cues.length === 0) {
    return <div className="p-4 text-sm text-gray-500">입력된 큐가 없습니다.</div>;
  }

  return (
    <ul className="divide-y">
      {cues.map((cue, i) => (
        <li key={`editor-${cue.id}`} className="p-3">
          <div className="mb-1 text-xs text-gray-500">큐 #{i + 1}</div>
          <div className="text-sm">화자: {getSpeakerForLanguage(cue, selectedLanguage) || '-'}</div>
          <div className="mb-2 whitespace-pre-wrap text-sm text-gray-800">{cue.texts[selectedLanguage] || '-'}</div>
          <div className="flex flex-wrap gap-2">
            <button className={buttonClass('gray')} onClick={() => onEdit(i)}>
              수정
            </button>
            <button className={buttonClass('blue')} onClick={() => onInsert(i)}>
              삽입
            </button>
            <button className={buttonClass('red')} onClick={() => onDelete(i)}>
              삭제
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
});

export default function CaptionsAdminPage() {
  const [title, setTitle] = useState('실시간 자막');
  const [roomCodeInput, setRoomCodeInput] = useState('koreahouse');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');

  const [selectedLanguage, setSelectedLanguage] = useState('korean');
  const [editorLanguage, setEditorLanguage] = useState('korean');
  const [leftDisplayLanguage, setLeftDisplayLanguage] = useState('korean');
  const [speakerInput, setSpeakerInput] = useState('');
  const [lineInput, setLineInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [prestartLanguage, setPrestartLanguage] = useState('korean');
  const [prestartInput, setPrestartInput] = useState('');
  const [prestartTexts, setPrestartTexts] = useState<Record<string, string>>({});

  const [cues, setCues] = useState<Cue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [liveIndex, setLiveIndex] = useState(-1);

  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);

  const selectedCue = selectedIndex >= 0 ? cues[selectedIndex] : null;
  const liveCue = liveIndex >= 0 ? cues[liveIndex] : null;

  const guestUrl = useMemo(() => {
    if (!roomCode) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/captions/view?roomCode=${roomCode}`;
  }, [roomCode]);

  const displayLanguages = useMemo(() => CAPTION_LANGUAGE_OPTIONS, []);

  useEffect(() => {
    setPrestartInput(prestartTexts[prestartLanguage] || '');
  }, [prestartLanguage, prestartTexts]);

  useEffect(() => {
    if (liveIndex < 0) return;
    const el = document.getElementById(`cue-left-${liveIndex}`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [liveIndex]);

  const syncCuesToServer = useCallback(
    async (nextCues: Cue[]) => {
      if (!roomCode) return;
      try {
        const res = await fetch('/api/captions/script', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode,
            cues: nextCues.map((cue) => ({
              speaker: cue.speaker || '',
              speakers: cue.speakers || {},
              texts: cue.texts || {},
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSyncError(data?.error || '자막 저장 동기화에 실패했습니다.');
          return;
        }
        setSyncError('');
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : String(error));
      }
    },
    [roomCode]
  );

  useEffect(() => {
    if (!roomCode || !syncEnabled) return;
    const timer = setTimeout(() => {
      void syncCuesToServer(cues);
    }, 350);
    return () => clearTimeout(timer);
  }, [cues, roomCode, syncEnabled, syncCuesToServer]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if (isTyping || busy) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        void moveSelection(selectedIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        void moveSelection(selectedIndex + 1);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, selectedIndex, cues.length, liveIndex]);

  const loadRoomCues = useCallback(async (targetRoomCode: string) => {
    try {
      const res = await fetch(`/api/captions/script?roomCode=${encodeURIComponent(targetRoomCode)}`);
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
            speakers: {
              [row.lang]: row.speaker || '',
            },
            texts: {
              [row.lang]: row.content || '',
            },
          });
        } else {
          existing.texts[row.lang] = row.content || '';
          existing.speakers[row.lang] = row.speaker || existing.speakers[row.lang] || '';
          if (!existing.speaker && row.speaker) existing.speaker = row.speaker;
        }
      }

      const nextCues = Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, cue]) => cue);

      setCues(nextCues);

      const state = (data.state || null) as HistoryStateRow | null;
      const nextLiveIndex = typeof state?.current_index === 'number' ? state.current_index : -1;
      if (nextCues.length === 0) {
        setSelectedIndex(-1);
        setLiveIndex(-1);
      } else {
        const safeLive = nextLiveIndex >= 0 ? Math.max(0, Math.min(nextLiveIndex, nextCues.length - 1)) : -1;
        setLiveIndex(safeLive);
        setSelectedIndex(safeLive >= 0 ? safeLive : 0);
      }

      if (nextCues.length > 0) {
        setMessage(`기존 자막 ${nextCues.length}개를 불러왔습니다.`);
      } else {
        setMessage('기존 자막이 없습니다. 새로 입력해 주세요.');
      }
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  async function loadPrestartTexts(targetRoomCode: string) {
    try {
      const res = await fetch(`/api/captions/prestart?roomCode=${encodeURIComponent(targetRoomCode)}`);
      const data = await res.json();
      if (!res.ok) return;
      setPrestartTexts((data?.texts || {}) as Record<string, string>);
    } catch {
      // ignore
    }
  }

  async function ensureRoom() {
    setBusy(true);
    setMessage('');
    setSyncEnabled(false);
    setSyncError('');
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
        setSelectedIndex(-1);
        setLiveIndex(-1);
      } else {
        setMessage('기존 룸에 연결되었습니다. 저장된 자막을 불러오는 중...');
      }
      await loadRoomCues(data.room.room_code);
      await loadPrestartTexts(data.room.room_code);
      setSyncEnabled(true);
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

    if (selectedLanguage !== OPERATOR_LANGUAGE_CODE) {
      if (selectedIndex < 0 || !cues[selectedIndex]) {
        setMessage('외국어 입력은 먼저 한국어 큐를 만든 뒤, 큐를 선택해서 입력해 주세요.');
        return;
      }
      updateCueAt(selectedIndex, (prev) => ({
        ...prev,
        speakers: {
          ...prev.speakers,
          ...(speaker ? { [selectedLanguage]: speaker } : {}),
        },
        texts: { ...prev.texts, [selectedLanguage]: line },
      }));
      setSpeakerInput('');
      setLineInput('');
      setMessage(`큐 #${selectedIndex + 1}의 ${selectedLanguage} 대사를 저장했습니다.`);
      return;
    }

    const nextCue = createCue(speaker, selectedLanguage, line);
    setCues((prev) => [...prev, nextCue]);
    setSpeakerInput('');
    setLineInput('');

    if (selectedIndex < 0) setSelectedIndex(0);
    setMessage('큐가 추가되었습니다.');
  }

  function addCuesFromBulkInput() {
    const raw = bulkInput.trim();
    if (!raw) {
      setMessage('대량 입력 내용이 비어 있습니다.');
      return;
    }

    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setMessage('유효한 줄이 없습니다.');
      return;
    }

    const parsed = lines.map((line) => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        return {
          speaker: parts[0].trim(),
          text: parts.slice(1).join(' ').trim(),
        };
      }
      return {
        speaker: '',
        text: line,
      };
    });

    if (selectedLanguage === OPERATOR_LANGUAGE_CODE) {
      const next = parsed.map((item) => createCue(item.speaker, selectedLanguage, item.text));
      setCues((prev) => [...prev, ...next]);
      if (selectedIndex < 0 && next.length > 0) {
        setSelectedIndex(0);
      }
      setBulkInput('');
      setMessage(`${next.length}개 한국어 큐를 일괄 추가했습니다.`);
      return;
    }

    if (cues.length === 0) {
      setMessage('먼저 한국어 대사를 입력해 큐를 만든 뒤 외국어를 일괄 입력해 주세요.');
      return;
    }

    const applyCount = Math.min(parsed.length, cues.length);
    setCues((prev) =>
      prev.map((cue, i) => {
        if (i >= applyCount) return cue;
        return {
          ...cue,
          speakers: {
            ...cue.speakers,
            ...(parsed[i].speaker ? { [selectedLanguage]: parsed[i].speaker } : {}),
          },
          texts: {
            ...cue.texts,
            [selectedLanguage]: parsed[i].text,
          },
        };
      })
    );

    const ignoredCount = Math.max(0, parsed.length - cues.length);
    setBulkInput('');
    if (ignoredCount > 0) {
      setMessage(`${selectedLanguage} ${applyCount}개를 큐에 매핑 저장했고, 초과 ${ignoredCount}줄은 무시했습니다.`);
    } else {
      setMessage(`${selectedLanguage} ${applyCount}개를 큐에 매핑 저장했습니다.`);
    }
  }

  function updateCueAt(index: number, updater: (cue: Cue) => Cue) {
    setCues((prev) => prev.map((cue, i) => (i === index ? updater(cue) : cue)));
  }

  const editCue = useCallback(
    (index: number) => {
      const cue = cues[index];
      if (!cue) return;

      const currentSpeakerByLang = cue.speakers?.[editorLanguage] ?? (editorLanguage === OPERATOR_LANGUAGE_CODE ? cue.speaker : '');
      const nextSpeaker = window.prompt('수정할 화자를 입력하세요.', currentSpeakerByLang ?? '');
      if (nextSpeaker === null) return;

      const currentText = cue.texts[editorLanguage] || '';
      const nextText = window.prompt('수정할 대사를 입력하세요.', currentText);
      if (nextText === null) return;

      updateCueAt(index, (prev) => {
        const texts = { ...prev.texts, [editorLanguage]: nextText.trim() };
        if (!texts[OPERATOR_LANGUAGE_CODE]) {
          texts[OPERATOR_LANGUAGE_CODE] = nextText.trim();
        }
        const nextSpeakers = {
          ...(prev.speakers || {}),
          [editorLanguage]: nextSpeaker.trim(),
        };
        return {
          ...prev,
          speaker: editorLanguage === OPERATOR_LANGUAGE_CODE ? nextSpeaker.trim() : prev.speaker,
          speakers: nextSpeakers,
          texts,
        };
      });
      setMessage('큐를 수정했습니다.');
    },
    [cues, editorLanguage]
  );

  const insertCueBelow = useCallback((index: number) => {
    const speaker = window.prompt('삽입할 화자를 입력하세요.', '') ?? '';
    const line = window.prompt('삽입할 대사를 입력하세요.', '') ?? '';
    if (!line.trim()) {
      setMessage('삽입이 취소되었거나 대사가 비어 있습니다.');
      return;
    }

    const newCue = createCue(speaker.trim(), OPERATOR_LANGUAGE_CODE, line.trim());
    setCues((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newCue);
      return copy;
    });

    if (selectedIndex > index) setSelectedIndex((prev) => prev + 1);
    if (liveIndex > index) setLiveIndex((prev) => prev + 1);
    setMessage('큐를 중간에 삽입했습니다.');
  }, [selectedIndex, liveIndex]);

  const deleteCue = useCallback((index: number) => {
    const ok = window.confirm('정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!ok) return;

    setCues((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex((prev) => {
      if (prev === index) return Math.max(0, Math.min(index, cues.length - 2));
      if (prev > index) return prev - 1;
      return prev;
    });
    setLiveIndex((prev) => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
    setMessage('큐를 삭제했습니다.');
  }, [cues.length]);

  async function publishCueAt(index: number, appendMessages: boolean) {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }
    const cue = cues[index];
    if (!cue || index < 0) {
      setMessage('송출할 큐가 없습니다.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const speakerMap = {
        ...(cue.speakers || {}),
        [OPERATOR_LANGUAGE_CODE]: cue.speaker || cue.speakers?.[OPERATOR_LANGUAGE_CODE] || '',
      };
      const res = await fetch('/api/captions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          currentIndex: index,
          currentLanguage: OPERATOR_LANGUAGE_CODE,
          currentSpeaker: JSON.stringify(speakerMap),
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

      setSelectedIndex(index);
      setLiveIndex(index);
      if (appendMessages) {
        setMessage(`송출 완료 (시퀀스: ${data.seq ?? '-'})`);
      } else {
        setMessage(`큐 #${index + 1} 송출 완료`);
      }
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function moveSelection(next: number) {
    if (cues.length === 0) return;
    const clamped = Math.max(0, Math.min(next, cues.length - 1));

    // 아직 최초 송출 전이면 선택만 이동
    if (liveIndex < 0) {
      setSelectedIndex(clamped);
      return;
    }

    // 최초 송출 이후에는 이전/다음이 실제 송출 큐를 즉시 갱신
    await publishCueAt(clamped, false);
  }

  async function publishSelectedCue() {
    if (!selectedCue || selectedIndex < 0) {
      setMessage('송출할 큐가 없습니다.');
      return;
    }
    await publishCueAt(selectedIndex, false);
  }

  async function clearLiveBroadcast() {
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
          currentIndex: -1,
          currentLanguage: OPERATOR_LANGUAGE_CODE,
          currentSpeaker: '',
          currentTexts: {},
          performanceTitle: title.trim(),
          appendMessages: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '송출 해제에 실패했습니다.'}`);
        return;
      }

      setLiveIndex(-1);
      setMessage('송출이 해제되었습니다. (시작 전 상태)');
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function resetRoom() {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }

    const confirmed = window.confirm('정말 초기화하시겠습니까?\n현재 룸의 실시간 상태와 히스토리가 모두 초기화됩니다.');
    if (!confirmed) return;

    setBusy(true);
    setMessage('');
    setSyncEnabled(false);
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
      setSelectedIndex(-1);
      setLiveIndex(-1);
      setSpeakerInput('');
      setLineInput('');
      setSelectedLanguage('korean');
      setMessage('룸 초기화가 완료되었습니다.');
      setSyncEnabled(true);
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function clearAllCaptions() {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }

    const confirmed = window.confirm('현재 룸의 자막 큐를 모두 삭제할까요? 룸 코드는 유지됩니다.');
    if (!confirmed) return;

    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/captions/script', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          cues: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '자막 전체 삭제에 실패했습니다.'}`);
        return;
      }

      setCues([]);
      setSelectedIndex(-1);
      setLiveIndex(-1);
      setSpeakerInput('');
      setLineInput('');
      setBulkInput('');
      setMessage('자막 전체 삭제가 완료되었습니다.');
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

  async function savePrestartText() {
    if (!roomCode) {
      setMessage('먼저 룸을 생성하거나 연결해 주세요.');
      return;
    }

    const nextTexts = {
      ...prestartTexts,
      [prestartLanguage]: prestartInput.trim(),
    };

    setBusy(true);
    try {
      const res = await fetch('/api/captions/prestart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          texts: nextTexts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`오류: ${data?.error || '시작 전 문구 저장에 실패했습니다.'}`);
        return;
      }
      setPrestartTexts(nextTexts);
      setMessage(`${prestartLanguage} 시작 전 문구를 저장했습니다.`);
    } catch (error) {
      setMessage(`오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">실시간 자막 운영자 페이지</h1>
        <div className="text-right">
          {message ? <p className="text-sm font-medium text-blue-700">{message}</p> : null}
          {syncError ? <p className="text-xs font-medium text-red-600">동기화 오류: {syncError}</p> : null}
        </div>
      </div>

      <div className="grid h-[calc(100vh-88px)] grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">입력 완료 대사</h2>
            <select className="rounded border p-2 text-sm" value={leftDisplayLanguage} onChange={(e) => setLeftDisplayLanguage(e.target.value)}>
              {displayLanguages.map((lang) => (
                <option key={`left-${lang.code}`} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded border">
            <LeftCueList
              cues={cues}
              selectedIndex={selectedIndex}
              liveIndex={liveIndex}
              displayLanguage={leftDisplayLanguage}
              busy={busy}
              onSelect={setSelectedIndex}
              onPublish={(index) => {
                void publishCueAt(index, false);
              }}
            />
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
                <button className={buttonClass('red')} disabled={busy || !roomCode} onClick={clearAllCaptions}>
                  자막 전체 삭제
                </button>
                <button className={buttonClass('red')} disabled={busy || !roomCode} onClick={resetRoom}>
                  룸 초기화
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">송출 제어</h3>
              <p className="mb-2 text-xs text-gray-600">단축키: `←` 이전 / `→` 다음</p>
              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                <button
                  className="rounded-lg bg-slate-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => moveSelection(selectedIndex - 1)}
                  disabled={busy || selectedIndex <= 0}
                >
                  ← 이전
                </button>
                <button
                  className="rounded-lg bg-slate-700 px-5 py-4 text-lg font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => moveSelection(selectedIndex + 1)}
                  disabled={busy || cues.length === 0 || selectedIndex >= cues.length - 1}
                >
                  다음 →
                </button>
                <button
                  className="rounded-lg bg-emerald-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={publishSelectedCue}
                  disabled={busy || !roomCode || !selectedCue}
                >
                  현재 자막 송출
                </button>
              </div>
              <div className="mb-2">
                <button
                  className="rounded-lg bg-orange-500 px-5 py-3 text-base font-bold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={clearLiveBroadcast}
                  disabled={busy || !roomCode}
                >
                  송출 해제 (시작 전 상태)
                </button>
              </div>
              <p className="text-sm text-gray-700">선택 인덱스: {selectedIndex >= 0 ? selectedIndex + 1 : 0} / {cues.length}</p>
              <p className="text-sm text-gray-700">송출 인덱스: {liveIndex >= 0 ? liveIndex + 1 : 0} / {cues.length}</p>
              <div className="mt-2 rounded border bg-slate-50 p-3">
                <div className="text-xs text-gray-500">송출 미리보기 (한국어)</div>
                <div className="text-sm font-semibold">화자: {selectedCue?.speaker || '-'}</div>
                <div className="mt-1 whitespace-pre-wrap text-base">{selectedCue?.texts.korean || '-'}</div>
                <div className="mt-2 text-xs text-gray-500">현재 실제 송출중</div>
                <div className="text-sm font-semibold">화자: {liveCue?.speaker || '-'}</div>
                <div className="mt-1 whitespace-pre-wrap text-base">{liveCue?.texts.korean || '-'}</div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">자막 입력</h3>
              <div className="grid gap-2 md:grid-cols-3">
                <select className="rounded border p-2" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
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
              <div className="mt-3 rounded border bg-slate-50 p-3">
                <p className="mb-2 text-sm font-semibold">대량 입력 (시트 붙여넣기)</p>
                <p className="mb-2 text-xs text-gray-600">
                  한 줄당 `화자[TAB]대사` 또는 `대사만` 입력하세요. 현재 선택 언어 기준으로 큐가 생성됩니다.
                </p>
                <textarea
                  className="min-h-28 w-full rounded border p-2 text-sm"
                  placeholder={'예시\n사회자\t좋은 아침입니다\n신랑\t감사합니다\n오늘 예식에 와주셔서 감사합니다'}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
                <div className="mt-2">
                  <button className={buttonClass('blue')} disabled={busy} onClick={addCuesFromBulkInput}>
                    대량 자막 추가
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">시작 전 안내 문구 (언어별)</h3>
              <p className="mb-2 text-xs text-gray-600">
                송출 시작 전(`current_index = -1`)에 관객 화면에 표시됩니다.
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                <select className="rounded border p-2" value={prestartLanguage} onChange={(e) => setPrestartLanguage(e.target.value)}>
                  {displayLanguages.map((lang) => (
                    <option key={`prestart-${lang.code}`} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border p-2 md:col-span-2"
                  placeholder="예: 지금은 전통혼례 시작 전입니다."
                  value={prestartInput}
                  onChange={(e) => setPrestartInput(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <button className={buttonClass('blue')} disabled={busy || !roomCode} onClick={savePrestartText}>
                  안내 문구 저장
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 font-semibold">입력된 자막 리스트 (선택 언어 기준)</h3>
              <div className="mb-2">
                <select className="rounded border p-2 text-sm" value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)}>
                  {displayLanguages.map((lang) => (
                    <option key={`editor-${lang.code}`} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="max-h-72 overflow-auto rounded border">
                <RightCueList
                  cues={cues}
                  selectedLanguage={editorLanguage}
                  onEdit={editCue}
                  onInsert={insertCueBelow}
                  onDelete={deleteCue}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
