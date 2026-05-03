import type { Metadata } from 'next';
import CaptionsViewerClient from './CaptionsViewerClient';

type PageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}
async function getRoomCodeFromSearchParams(searchParams: PageProps['searchParams']): Promise<string> {
  const resolvedParams = (await Promise.resolve(searchParams || {})) as Record<
    string,
    string | string[] | undefined
  >;

  return (getParam(resolvedParams, 'roomCode') || getParam(resolvedParams, 'session'))
    .trim()
    .toLowerCase();
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const roomCode = await getRoomCodeFromSearchParams(searchParams);

  if (roomCode === 'yayeon') {
    return {
      title: '2026 \ucc3d\uacbd\uad81 \uc57c\uc5f0 \uc2e4\uc2dc\uac04 \uc790\ub9c9',
    };
  }

  return {};
}

export default async function CaptionsViewerPage({ searchParams }: PageProps) {
  const roomCode = await getRoomCodeFromSearchParams(searchParams);

  return <CaptionsViewerClient initialRoomCode={roomCode} />;
}
