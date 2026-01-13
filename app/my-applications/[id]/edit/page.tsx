'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Application } from '@/types';
import { createClient } from '@/lib/supabase/client';
import ApplicationForm from '@/components/ApplicationForm';

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        console.error('Error fetching application:', err);
        alert('신청 내역을 불러오는 중 오류가 발생했습니다.');
        router.push('/my-applications');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApplication();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">신청 내역을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationForm 
        type={application.type} 
        isEditMode={true}
        originalApplication={application}
      />
    </div>
  );
}
