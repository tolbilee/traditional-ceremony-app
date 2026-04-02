import CaptionsViewerClient from './CaptionsViewerClient';

type PageProps = {
  searchParams?: {
    roomCode?: string;
    session?: string;
  };
};

export default function CaptionsViewerPage({ searchParams }: PageProps) {
  // Backward compatibility: support both ?roomCode= and old ?session=
  const roomCode = (searchParams?.roomCode || searchParams?.session || '').trim().toLowerCase();
  return <CaptionsViewerClient initialRoomCode={roomCode} />;
}
