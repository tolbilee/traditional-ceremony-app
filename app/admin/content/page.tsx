import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function ContentEditorPage() {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return <ContentEditor />;
}
