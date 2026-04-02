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

export default async function CaptionsViewerPage({ searchParams }: PageProps) {
  // Next.js versions/environments may provide searchParams as a Promise in server components.
  const resolvedParams = (await Promise.resolve(searchParams || {})) as Record<
    string,
    string | string[] | undefined
  >;

  // Backward compatibility: support both ?roomCode= and old ?session=
  const roomCode = (getParam(resolvedParams, 'roomCode') || getParam(resolvedParams, 'session'))
    .trim()
    .toLowerCase();

  return <CaptionsViewerClient initialRoomCode={roomCode} />;
}
