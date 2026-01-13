import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const ADMIN_SESSION_KEY = 'admin_session';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_KEY, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_KEY);
  return session?.value === 'authenticated';
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_KEY);
}
