import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HEALTH_TIMEOUT_MS = 3000;

export async function GET() {
  const startedAt = Date.now();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const env = {
    nextPublicSupabaseUrl: Boolean(supabaseUrl),
    nextPublicSupabaseAnonKey: Boolean(supabaseAnonKey),
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        phase: 'config',
        env,
        message: 'Supabase environment variables are missing',
        latencyMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase health timeout')), HEALTH_TIMEOUT_MS);
    });

    const queryPromise = supabase.from('applications').select('id').limit(1);
    const { error } = (await Promise.race([queryPromise, timeoutPromise])) as {
      error: { message?: string } | null;
    };

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          phase: 'supabase',
          env,
          message: error.message || 'Supabase query failed',
          latencyMs: Date.now() - startedAt,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        phase: 'ready',
        env,
        latencyMs: Date.now() - startedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        phase: 'runtime',
        env,
        message: error instanceof Error ? error.message : String(error),
        latencyMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}
