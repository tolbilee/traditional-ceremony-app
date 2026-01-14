'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CeremonyType } from '@/types';
import ApplicationForm from '@/components/ApplicationForm';

export default function ApplyPage() {
  const params = useParams();
  const type = (params.type as CeremonyType) || 'wedding';

  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationForm type={type} />
    </div>
  );
}

