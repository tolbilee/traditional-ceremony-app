import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * 서비스 역할 키를 사용하는 Supabase 클라이언트
 * RLS 정책을 우회하여 모든 작업을 수행할 수 있습니다.
 * 
 * ⚠️ 주의: 이 키는 절대 클라이언트에 노출되면 안 됩니다!
 * 서버 사이드에서만 사용해야 합니다.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
