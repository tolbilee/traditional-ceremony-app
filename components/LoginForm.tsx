'use client';

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (userName: string, birthDate: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userName.trim()) {
      setError('성명을 입력해주세요.');
      return;
    }

    if (!birthDate || birthDate.length !== 6) {
      setError('생년월일 6자리를 입력해주세요. (예: 900101)');
      return;
    }

    // 생년월일 6자리 형식 검증 (YYMMDD)
    const birthRegex = /^\d{6}$/;
    if (!birthRegex.test(birthDate)) {
      setError('생년월일은 6자리 숫자로 입력해주세요.');
      return;
    }

    onLogin(userName.trim(), birthDate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <p className="text-gray-600">
        신청 시 입력하신 성명과 생년월일을 입력해주세요.
      </p>

      <div>
        <label htmlFor="userName" className="block text-sm font-semibold text-gray-700">
          성명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-1 w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg"
          placeholder="홍길동"
          required
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700">
          생년월일 (6자리) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="birthDate"
          value={birthDate}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setBirthDate(value);
          }}
          className="mt-1 w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg"
          placeholder="900101"
          maxLength={6}
          required
        />
        <p className="mt-1 text-xs text-gray-500">예: 1990년 1월 1일 → 900101</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
      >
        조회하기
      </button>
    </form>
  );
}

