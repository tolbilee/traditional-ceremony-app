'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplicationList from '@/components/ApplicationList';
import LoginForm from '@/components/LoginForm';

export default function MyApplicationsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleLogin = (name: string, birth: string) => {
    setUserName(name);
    setBirthDate(birth);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setBirthDate('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-md">
          <h1 className="mb-8 text-3xl font-bold text-gray-800">나의 신청내역</h1>
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">나의 신청내역</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300"
          >
            로그아웃
          </button>
        </div>
        <ApplicationList userName={userName} birthDate={birthDate} />
      </div>
    </div>
  );
}
