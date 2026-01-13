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
  }

  return (
    <AdminDashboard applications={applications || []} />
  );
}
