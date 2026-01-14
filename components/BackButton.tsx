'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  onClick?: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-center gap-2 rounded-t-lg border-t-2 border-gray-200 bg-white px-6 py-4 text-lg font-semibold text-gray-700 shadow-lg transition-all hover:bg-gray-50 active:bg-gray-100"
    >
      <span>←</span>
      <span>뒤로가기</span>
    </button>
  );
}

