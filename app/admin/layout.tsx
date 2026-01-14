import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 페이지는 인증 체크 제외
  const isLoginPage = false; // 이건 각 페이지에서 처리

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

