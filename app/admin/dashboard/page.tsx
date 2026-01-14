import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminDashboardPage() {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const supabase = await createClient();
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }

  // 디버깅: 데이터 확인
  console.log('Applications fetched:', applications?.length || 0);
  if (applications && applications.length > 0) {
    console.log('First application:', JSON.stringify(applications[0], null, 2));
  }

  return (
    <AdminDashboard applications={applications || []} error={error} />
  );
}

