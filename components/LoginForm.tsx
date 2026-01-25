'use client';

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (userName: string, birthDate: string, loginType?: 'normal' | 'visiting', businessNumber?: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [loginType, setLoginType] = useState<'normal' | 'visiting'>('normal');
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginType === 'normal') {
      // 일반 로그인: 이름 + 생년월일
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

      onLogin(userName.trim(), birthDate, 'normal');
    } else {
      // 찾아가는 돌잔치 로그인: 대표자 이름 + 사업자 번호
      if (!userName.trim()) {
        setError('대표자 이름을 입력해주세요.');
        return;
      }

      const businessNumDigits = businessNumber.replace(/\D/g, '');
      if (!businessNumDigits || businessNumDigits.length !== 10) {
        setError('사업자 번호 10자리를 입력해주세요.');
        return;
      }

      onLogin(userName.trim(), '', 'visiting', businessNumDigits);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      {/* 로그인 타입 선택 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          로그인 유형 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="loginType"
              value="normal"
              checked={loginType === 'normal'}
              onChange={() => {
                setLoginType('normal');
                setError('');
              }}
              className="mr-2 h-5 w-5"
            />
            <span>일반 신청</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="loginType"
              value="visiting"
              checked={loginType === 'visiting'}
              onChange={() => {
                setLoginType('visiting');
                setError('');
              }}
              className="mr-2 h-5 w-5"
            />
            <span>찾아가는 돌잔치</span>
          </label>
        </div>
      </div>

      {loginType === 'normal' ? (
        <>
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
        </>
      ) : (
        <>
          <p className="text-gray-600">
            신청 시 입력하신 대표자 이름과 사업자 번호를 입력해주세요.
          </p>

          <div>
            <label htmlFor="representative" className="block text-sm font-semibold text-gray-700">
              대표자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="representative"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg"
              placeholder="홍길동"
              required
            />
          </div>

          <div>
            <label htmlFor="businessNumber" className="block text-sm font-semibold text-gray-700">
              사업자 번호 (10자리) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="businessNumber"
              value={businessNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                let formatted = value;
                if (value.length > 3) {
                  formatted = value.slice(0, 3) + '-' + value.slice(3);
                }
                if (value.length > 5) {
                  formatted = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5);
                }
                setBusinessNumber(formatted);
              }}
              className="mt-1 w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg"
              placeholder="000-00-00000"
              maxLength={12}
              required
            />
            <p className="mt-1 text-xs text-gray-500">예: 000-00-00000</p>
          </div>
        </>
      )}

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

