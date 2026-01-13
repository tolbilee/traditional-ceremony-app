import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';
import ApplicationDetail from '@/components/admin/ApplicationDetail';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !application) {
    redirect('/admin/dashboard');
  }

  return <ApplicationDetail application={application} />;
}
